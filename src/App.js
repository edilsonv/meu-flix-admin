import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import './App.css';

function App() {
  // Estados de Autenticação
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Seus estados originais
  const [filmes, setFilmes] = useState([]);
  const [filme, setFilme] = useState({ id_filme: '', titulo: '', capa: '', url_video: '', descricao: '', categoria: '' });
  const [status, setStatus] = useState("");

  // 1. Monitora o Login (O segredo para pedir login)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Busca filmes (Só executa se houver usuário logado)
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, "filmes"), (snapshot) => {
        const dados = snapshot.docs.map(d => ({ id_db: d.id, ...d.data() }));
        setFilmes(dados);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Falha no login: verifique e-mail e senha.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilme(prev => ({ ...prev, [name]: value }));
  };

  const salvarNoFirebase = async (e) => {
    e.preventDefault();
    setStatus("enviando");
    try {
      await addDoc(collection(db, "filmes"), filme);
      setStatus("sucesso");
      setFilme({ id_filme: '', titulo: '', capa: '', url_video: '', descricao: '', categoria: '' });
      setTimeout(() => setStatus(""), 3000);
    } catch (error) { setStatus("erro"); }
  };

  const deletarFilme = async (id) => {
    if(window.confirm("Deseja realmente excluir?")) {
      await deleteDoc(doc(db, "filmes", id));
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  // SE NÃO ESTIVER LOGADO: MOSTRA TELA DE LOGIN
  if (!user) {
    return (
      <div className="admin-app login-screen">
        <h1 className="logo">MEUFLIX <span>ADMIN</span></h1>
        <form onSubmit={handleLogin} className="form-cadastro" style={{maxWidth: '400px', margin: 'auto'}}>
          <h2>Login Administrativo</h2>
          <input type="email" placeholder="Seu e-mail" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Sua senha" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-cadastrar">Entrar</button>
        </form>
      </div>
    );
  }

  // SE ESTIVER LOGADO: MOSTRA O PAINEL
  return (
    <div className="admin-app">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px'}}>
        <h1 className="logo">MEUFLIX <span>ADMIN</span></h1>
        <button onClick={handleLogout} className="btn-excluir" style={{height: '40px'}}>Sair</button>
      </div>
      
      <div className="admin-grid">
        <section className="painel-cadastro">
          <h2>Cadastrar Novo Título</h2>
          <form onSubmit={salvarNoFirebase} className="form-cadastro">
            <input name="id_filme" value={filme.id_filme} onChange={handleChange} placeholder="ID do Filme" required />
            <input name="titulo" value={filme.titulo} onChange={handleChange} placeholder="Título do Filme" required />
            <input name="capa" value={filme.capa} onChange={handleChange} placeholder="URL da Capa" required />
            <input name="url_video" value={filme.url_video} onChange={handleChange} placeholder="URL do Vídeo" required />
            <input name="categoria" value={filme.categoria} onChange={handleChange} placeholder="Categoria" required />
            <textarea name="descricao" value={filme.descricao} onChange={handleChange} placeholder="Sinopse" rows="4" />
            <button type="submit" className={`btn-cadastrar ${status}`}>
              {status === "enviando" ? "Salvando..." : status === "sucesso" ? "✓ Adicionado!" : "Adicionar Filme"}
            </button>
          </form>
        </section>

        <section className="painel-lista">
          <h2>Catálogo ({filmes.length})</h2>
          <div className="lista-scroll">
            {filmes.map(f => (
              <div key={f.id_db} className="admin-card">
                <img src={f.capa} alt="capa" />
                <div className="admin-info">
                  <strong>{f.titulo}</strong>
                  <p>{f.categoria}</p>
                </div>
                <button className="btn-excluir" onClick={() => deletarFilme(f.id_db)}>Excluir</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;