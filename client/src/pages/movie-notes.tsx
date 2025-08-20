import { useState, useEffect, useRef } from 'react';

interface Movie {
  nome: string;
  notaDel: number;
  notaEttore: number;
  media: number;
  fotos: string[];
  dataCriacao: string;
  dataModificacao?: string;
}

export default function MovieNotes() {
  const [filmes, setFilmes] = useState<Movie[]>([]);
  const [filteredFilmes, setFilteredFilmes] = useState<Movie[]>([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [nomeFilme, setNomeFilme] = useState('');
  const [notaDel, setNotaDel] = useState('');
  const [notaEttore, setNotaEttore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultado, setResultado] = useState('');
  const [showResultado, setShowResultado] = useState(false);
  
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFilmes = localStorage.getItem('filmes');
    if (savedFilmes) {
      const parsedFilmes = JSON.parse(savedFilmes);
      // Migrate old data format
      const migratedFilmes = parsedFilmes.map((filme: any) => {
        if (filme.foto && !filme.fotos) {
          filme.fotos = [filme.foto];
          delete filme.foto;
        }
        if (!filme.fotos) {
          filme.fotos = [];
        }
        if (!filme.dataCriacao) {
          filme.dataCriacao = new Date().toLocaleDateString('pt-BR');
        }
        return filme;
      });
      setFilmes(migratedFilmes);
      setFilteredFilmes(migratedFilmes);
    }
  }, []);

  // Save to localStorage whenever filmes changes
  useEffect(() => {
    localStorage.setItem('filmes', JSON.stringify(filmes));
  }, [filmes]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFilmes([...filmes]);
    } else {
      const filtered = filmes.filter(f => 
        f.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFilmes(filtered);
    }
  }, [searchTerm, filmes]);

  const parseNota = (str: string): number => {
    if (typeof str !== 'string') return NaN;
    const normalized = str.trim().replace(',', '.');
    const n = parseFloat(normalized);
    return isNaN(n) ? NaN : n;
  };

  const limparInputs = () => {
    setNomeFilme('');
    setNotaDel('');
    setNotaEttore('');
    setEditIndex(-1);
  };

  const mostrarResultado = (text: string) => {
    if (!text) {
      setShowResultado(false);
      return;
    }
    setResultado(text);
    setShowResultado(true);
    setTimeout(() => setShowResultado(false), 3500);
  };

  const calcularESalvar = () => {
    const nome = nomeFilme.trim();
    const n1 = parseNota(notaDel);
    const n2 = parseNota(notaEttore);
    
    if (!nome || isNaN(n1) || isNaN(n2)) {
      mostrarResultado('Preencha nome e as duas notas corretamente.');
      return;
    }
    
    const media = (n1 + n2) / 2;
    const agora = new Date().toLocaleDateString('pt-BR');
    
    if (editIndex >= 0) {
      const updatedFilmes = [...filmes];
      updatedFilmes[editIndex] = {
        ...updatedFilmes[editIndex],
        nome,
        notaDel: n1,
        notaEttore: n2,
        media,
        dataModificacao: agora
      };
      setFilmes(updatedFilmes);
      mostrarResultado(`Atualizado: ${nome} — ${media}`);
    } else {
      const newMovie: Movie = {
        nome,
        notaDel: n1,
        notaEttore: n2,
        media,
        fotos: [],
        dataCriacao: agora
      };
      setFilmes([...filmes, newMovie]);
      mostrarResultado(`Salvo: ${nome} — ${media}`);
    }
    
    limparInputs();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calcularESalvar();
    }
  };

  const adicionarFotos = (idx: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const files = Array.from(target.files || []);
        if (files.length === 0) return;
        
        let processedCount = 0;
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
            const updatedFilmes = [...filmes];
            if (!updatedFilmes[idx].fotos) updatedFilmes[idx].fotos = [];
            updatedFilmes[idx].fotos.push(reader.result as string);
            processedCount++;
            if (processedCount === files.length) {
              setFilmes(updatedFilmes);
            }
          };
          reader.readAsDataURL(file);
        });
      };
      fileInputRef.current.click();
    }
  };

  const excluirFoto = (filmeIdx: number, fotoIdx: number) => {
    const updatedFilmes = [...filmes];
    if (updatedFilmes[filmeIdx].fotos && updatedFilmes[filmeIdx].fotos[fotoIdx]) {
      updatedFilmes[filmeIdx].fotos.splice(fotoIdx, 1);
      setFilmes(updatedFilmes);
    }
  };

  const editarFilme = (filme: Movie, idx: number) => {
    setNomeFilme(filme.nome);
    setNotaDel(String(filme.notaDel).replace('.', ','));
    setNotaEttore(String(filme.notaEttore).replace('.', ','));
    setEditIndex(idx);
    if (nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  };

  const excluirFilme = (idx: number) => {
    const updatedFilmes = [...filmes];
    updatedFilmes.splice(idx, 1);
    setFilmes(updatedFilmes);
  };

  // Calculate statistics
  const totalFilmes = filmes.length;
  const mediaDel = totalFilmes > 0 
    ? (filmes.reduce((acc, f) => acc + f.notaDel, 0) / totalFilmes).toFixed(1)
    : '-';
  const mediaEttore = totalFilmes > 0 
    ? (filmes.reduce((acc, f) => acc + f.notaEttore, 0) / totalFilmes).toFixed(1)
    : '-';
  const mediaGeral = totalFilmes > 0 
    ? (filmes.reduce((acc, f) => acc + f.media, 0) / totalFilmes).toFixed(1)
    : '-';

  // Sort filtered movies by creation date (newest first)
  const filmesOrdenados = [...filteredFilmes].sort((a, b) => {
    const dataA = a.dataCriacao || '01/01/1900';
    const dataB = b.dataCriacao || '01/01/1900';
    const dateA = new Date(dataA.split('/').reverse().join('-'));
    const dateB = new Date(dataB.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="container">
      <header>
        <h1 className="movie-title">Notas de Filmes</h1>
        <p className="hidden m-1.5 text-movie-muted text-sm text-center">
          Tema escuro com destaques em laranja e vermelho. As notas são salvas no navegador. Pressione Enter para salvar.
        </p>
      </header>

      <div className="movie-card">
        <div className="flex gap-2 flex-wrap items-center justify-center max-sm:flex-col max-sm:items-stretch">
          <input
            ref={nomeInputRef}
            className="movie-input movie-input-text max-sm:w-full"
            type="text"
            placeholder="Nome do filme"
            value={nomeFilme}
            onChange={(e) => setNomeFilme(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <input
            className="movie-input"
            type="text"
            placeholder="Nota da Del"
            value={notaDel}
            onChange={(e) => setNotaDel(e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="decimal"
          />
          <input
            className="movie-input"
            type="text"
            placeholder="Nota do Ettore"
            value={notaEttore}
            onChange={(e) => setNotaEttore(e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="decimal"
          />
          <button 
            className="movie-btn movie-btn-primary"
            onClick={calcularESalvar}
          >
            {editIndex >= 0 ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
        {showResultado && (
          <div className="movie-result">
            {resultado}
          </div>
        )}
      </div>

      <div className="movie-card" style={{ marginTop: '14px' }}>
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-movie-text mb-3">Estatísticas</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4 bg-movie-item-bg rounded-lg border border-movie-orange/20 hover:border-movie-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-movie-orange/10">
            <div className="text-3xl font-bold text-movie-orange mb-2" style={{ textShadow: '0 0 10px rgba(255, 106, 0, 0.4)' }}>
              {totalFilmes}
            </div>
            <div className="text-sm text-movie-muted font-medium uppercase tracking-wide">Total Filmes</div>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-movie-item-bg rounded-lg border border-movie-orange/20 hover:border-movie-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-movie-orange/10">
            <div className="text-3xl font-bold text-movie-orange-2 mb-2" style={{ textShadow: '0 0 10px rgba(255, 140, 58, 0.4)' }}>
              {mediaGeral}
            </div>
            <div className="text-sm text-movie-muted font-medium uppercase tracking-wide">Média Geral</div>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-movie-item-bg rounded-lg border border-movie-orange/20 hover:border-movie-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-movie-orange/10">
            <div className="text-3xl font-bold text-movie-orange-2 mb-2" style={{ textShadow: '0 0 10px rgba(255, 140, 58, 0.4)' }}>
              {mediaDel}
            </div>
            <div className="text-sm text-movie-muted font-medium uppercase tracking-wide">Média Del</div>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-movie-item-bg rounded-lg border border-movie-orange/20 hover:border-movie-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-movie-orange/10">
            <div className="text-3xl font-bold text-movie-orange-2 mb-2" style={{ textShadow: '0 0 10px rgba(255, 140, 58, 0.4)' }}>
              {mediaEttore}
            </div>
            <div className="text-sm text-movie-muted font-medium uppercase tracking-wide">Média Ettore</div>
          </div>
        </div>
      </div>

      <div className="movie-card" style={{ marginTop: '14px' }}>
        <div className="flex gap-3 items-center justify-between flex-wrap mb-3 max-sm:flex-col max-sm:items-stretch">
          <div className="flex-1 min-w-[200px] max-sm:min-w-full">
            <input
              className="movie-input w-full"
              type="text"
              placeholder="Buscar filmes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="m-0 text-lg text-movie-text">Filmes Salvos</h2>
        </div>
        
        <div className="mt-2.5 flex flex-col gap-2">
          {filmesOrdenados.length === 0 ? (
            <div className="text-movie-muted p-2.5">
              {searchTerm.trim() ? 'Nenhum filme encontrado.' : 'Nenhum filme salvo ainda.'}
            </div>
          ) : (
            filmesOrdenados.map((filme) => {
              const originalIdx = filmes.indexOf(filme);
              return (
                <div key={`${filme.nome}-${originalIdx}`} className="movie-item">
                  <div className="flex flex-col gap-1.5 items-start min-w-0">
                    <div className="flex items-center gap-3 w-full max-sm:flex-col max-sm:items-start max-sm:gap-1">
                      <div className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[380px]" title={filme.nome}>
                        {filme.nome}
                      </div>
                      <div className="text-xs text-movie-muted min-w-fit max-sm:w-full">
                        {filme.dataCriacao}
                      </div>
                      <div className="text-movie-orange-2 font-bold ml-2 min-w-14 text-right max-sm:ml-0 max-sm:text-left">
                        {filme.media} | Del: {filme.notaDel} | Ettore: {filme.notaEttore}
                      </div>
                    </div>
                    
                    {filme.fotos && filme.fotos.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2 max-sm:justify-start">
                        {filme.fotos.map((foto, fotoIdx) => (
                          <div key={fotoIdx} className="relative inline-block">
                            <img
                              src={foto}
                              alt={`Foto ${fotoIdx + 1} de ${filme.nome}`}
                              className="movie-photo"
                            />
                            <button
                              className="movie-btn-delete-photo"
                              title="Excluir foto"
                              onClick={() => excluirFoto(originalIdx, fotoIdx)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 items-center flex-wrap max-sm:justify-start">
                    <button
                      className="movie-btn movie-btn-edit"
                      onClick={() => editarFilme(filme, originalIdx)}
                    >
                      Editar
                    </button>
                    <button
                      className="movie-btn movie-btn-photo"
                      onClick={() => adicionarFotos(originalIdx)}
                    >
                      Fotos
                    </button>
                    <button
                      className="movie-btn movie-btn-delete"
                      onClick={() => excluirFilme(originalIdx)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
