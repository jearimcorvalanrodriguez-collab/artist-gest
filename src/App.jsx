import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Calendar, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  RefreshCw, 
  Lock, 
  Folder, 
  FileText, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Edit3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ESQUEMAS_MASTER_SECRET = 'Tk9fTWVfSGFja2VlczIwMjYhQCM=';
const ACCESS_PASSCODE = 'ARTIST2026';

// --- PIANO LOADER COMPONENT ---
const PianoLoader = ({ size = 80, showLabel = true }) => {
  const widthVal = size * 1.68;
  return (
    <div className="flex flex-col items-center justify-center p-2 space-y-2 inline-flex">
      <div className="relative" style={{ width: `${widthVal}px`, height: `${size}px` }}>
        <svg viewBox="0 0 84 50" className="w-full h-full">
          {/* Teclas Blancas */}
          <rect x="0" y="0" width="11" height="50" rx="1.5" className="animate-key-1 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="12" y="0" width="11" height="50" rx="1.5" className="animate-key-2 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="24" y="0" width="11" height="50" rx="1.5" className="animate-key-3 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="36" y="0" width="11" height="50" rx="1.5" className="animate-key-4 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="48" y="0" width="11" height="50" rx="1.5" className="animate-key-5 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="60" y="0" width="11" height="50" rx="1.5" className="animate-key-6 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="72" y="0" width="11" height="50" rx="1.5" className="animate-key-7 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />

          {/* Teclas Negras */}
          <rect x="8" y="0" width="6" height="30" rx="1" className="animate-bkey-1 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="20" y="0" width="6" height="30" rx="1" className="animate-bkey-2 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="44" y="0" width="6" height="30" rx="1" className="animate-bkey-3 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="56" y="0" width="6" height="30" rx="1" className="animate-bkey-4 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="68" y="0" width="6" height="30" rx="1" className="animate-bkey-5 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
        </svg>
      </div>
      {showLabel && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse mt-1">Procesando Setlist...</p>}
    </div>
  );
};

// --- BASE COMPONENTS ---
const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden ${onClick ? 'cursor-pointer hover:border-emerald-500 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled, icon: Icon }) => {
  const base = "px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const styles = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/20",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/20",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800"
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// --- API FETCH HELPER ---
const apiFetch = async (action, payload = {}) => {
  const url = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwNXxsCfNlOV-JkeUO2Sl55SquzwcrwP50ZpfSUyeg-mI1ugvtCw-1E1mLF-2OS5tmAEw/exec';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ app_secret: ESQUEMAS_MASTER_SECRET, action, payload })
  });
  return response.json();
};

export default function App() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [shows, setShows] = useState([]);
  const [activeShow, setActiveShow] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const pdfRef = useRef(null);

  // Setlist editing states
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongKey, setNewSongKey] = useState('');
  const [newSongBpm, setNewSongBpm] = useState('');
  const [newSongNotes, setNewSongNotes] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check auth persistence
  useEffect(() => {
    const savedAuth = window.localStorage.getItem('artist_gest_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchProjects();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === ACCESS_PASSCODE) {
      setIsAuthenticated(true);
      window.localStorage.setItem('artist_gest_auth', 'true');
      setLoginError('');
      fetchProjects();
    } else {
      setLoginError('Código de acceso incorrecto.');
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('artist_gest_auth');
    setIsAuthenticated(false);
    setProjects([]);
    setSelectedProject(null);
    setShows([]);
    setActiveShow(null);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        setProjects(res.data || []);
      } else {
        showToast('Error al cargar proyectos.');
      }
    } catch (err) {
      showToast('Error de conexión con el servidor.');
    }
    setLoading(false);
  };

  const loadShowsForProject = async (project) => {
    setSelectedProject(project);
    setActiveShow(null);
    setLoading(true);
    try {
      const res = await apiFetch('getRiders');
      if (res.status === 'success') {
        // Filter setlists belonging to this project
        const projectSetlists = (res.data || []).filter(r => {
          let isMatch = false;
          try {
            const parsed = JSON.parse(r.content);
            isMatch = parsed.proyectoId === project.id && r.title.startsWith('[Setlist] ');
          } catch(e) {}
          return isMatch;
        });

        // Parse setlists back to show structures
        const parsedShows = projectSetlists.map(r => {
          const parsedContent = JSON.parse(r.content);
          const name = r.title.replace('[Setlist] ', '');
          const date = parsedContent.recordatorio || '';
          const notes = parsedContent.importante || '';
          
          // Re-map backline array back to setlist items
          const setlist = (parsedContent.backline || []).map(b => ({
            song: b.col1 || '',
            key: b.col3?.split(' | ')[0]?.replace('Key: ', '') || '',
            bpm: b.col3?.split(' | ')[1]?.replace('BPM: ', '') || '',
            notes: b.col4 || ''
          }));

          return {
            riderId: r.id,
            name,
            date,
            notes,
            setlist
          };
        });

        setShows(parsedShows);
      } else {
        showToast('Error al cargar setlists.');
      }
    } catch (err) {
      showToast('Error al conectar con la base de datos.');
    }
    setLoading(false);
  };

  const handleCreateShow = () => {
    if (!selectedProject) return;
    const newShow = {
      name: `Show ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      setlist: []
    };
    setShows(prev => [...prev, newShow]);
    setActiveShow(newShow);
  };

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!newSongTitle.trim() || !activeShow) return;

    const newSong = {
      song: newSongTitle.trim(),
      key: newSongKey.trim().toUpperCase() || 'N/A',
      bpm: newSongBpm.trim() || 'N/A',
      notes: newSongNotes.trim()
    };

    const updatedShow = {
      ...activeShow,
      setlist: [...activeShow.setlist, newSong]
    };

    setActiveShow(updatedShow);
    setShows(prev => prev.map(s => s.name === activeShow.name && s.date === activeShow.date ? updatedShow : s));

    // Clear inputs
    setNewSongTitle('');
    setNewSongKey('');
    setNewSongBpm('');
    setNewSongNotes('');
  };

  const handleRemoveSong = (idx) => {
    if (!activeShow) return;
    const updatedSetlist = activeShow.setlist.filter((_, i) => i !== idx);
    const updatedShow = { ...activeShow, setlist: updatedSetlist };
    setActiveShow(updatedShow);
    setShows(prev => prev.map(s => s.name === activeShow.name && s.date === activeShow.date ? updatedShow : s));
  };

  const moveSong = (idx, direction) => {
    if (!activeShow) return;
    const newSetlist = [...activeShow.setlist];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newSetlist.length) return;

    // Swap
    const temp = newSetlist[idx];
    newSetlist[idx] = newSetlist[targetIdx];
    newSetlist[targetIdx] = temp;

    const updatedShow = { ...activeShow, setlist: newSetlist };
    setActiveShow(updatedShow);
    setShows(prev => prev.map(s => s.name === activeShow.name && s.date === activeShow.date ? updatedShow : s));
  };

  const handleSaveShow = async () => {
    if (!selectedProject || !activeShow) return;
    setLoading(true);
    try {
      // Map show structure into standard Crew Rider format
      const riderPayload = {
        proyectoId: selectedProject.id,
        importante: activeShow.notes,
        soundcheck: "Setlist oficial del show sincronizado por Artist-Gest.",
        recordatorio: activeShow.date,
        backline: activeShow.setlist.map((s, idx) => ({
          col1: s.song,
          col2: String(idx + 1),
          col3: `Key: ${s.key} | BPM: ${s.bpm}`,
          col4: s.notes
        })),
        inputs: [{ ch: '', name: '', mic: '', v48: '', stand: '', position: '', obs: '' }],
        outputs: [{ mix: '', player: '', monitor: '', obs: '' }],
        visuals: [{ col1: '', col2: '', col3: '', col4: '' }],
        stageplot: [],
        catering: { showSizes: false, showCatEquipo: false, notes: '', tables: [] }
      };

      const riderTitle = `[Setlist] ${activeShow.name}`;

      if (activeShow.riderId) {
        // Update existing rider
        const res = await apiFetch('updateRider', {
          id: activeShow.riderId,
          title: riderTitle,
          type: 'COMPLETO',
          content: JSON.stringify(riderPayload)
        });
        if (res.status === 'success') {
          showToast('Show actualizado en la base de datos.');
          loadShowsForProject(selectedProject);
        } else {
          showToast(`Error: ${res.message}`);
        }
      } else {
        // Create new rider
        const res = await apiFetch('createRider', {
          title: riderTitle,
          type: 'COMPLETO',
          content: JSON.stringify(riderPayload)
        });
        if (res.status === 'success') {
          showToast('Show creado y sincronizado con éxito.');
          loadShowsForProject(selectedProject);
        } else {
          showToast(`Error: ${res.message}`);
        }
      }
    } catch (err) {
      showToast('Error de red al guardar.');
    }
    setLoading(false);
  };

  const handleDeleteShow = async (show) => {
    if (!show.riderId) {
      // Just remove from local list if not saved to Sheets
      setShows(prev => prev.filter(s => s !== show));
      setActiveShow(null);
      return;
    }
    
    if (!window.confirm(`¿Estás seguro de eliminar el show "${show.name}"? Se borrará también de los riders del crew.`)) return;

    setLoading(true);
    try {
      const res = await apiFetch('deleteRider', { id: show.riderId });
      if (res.status === 'success') {
        showToast('Show eliminado.');
        loadShowsForProject(selectedProject);
      } else {
        showToast(`Error: ${res.message}`);
      }
    } catch (err) {
      showToast('Error al conectar para eliminar.');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!activeShow) return;
    const element = pdfRef.current;
    showToast('Generando PDF del Setlist...');
    
    const opt = {
      margin: 10,
      filename: `Setlist_${activeShow.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2canvas(element, opt.html2canvas).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF(opt.jsPDF);
      const imgWidth = 210 - (opt.margin * 2);
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = opt.margin;

      pdf.addImage(imgData, 'JPEG', opt.margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + opt.margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', opt.margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(opt.filename);
      showToast('PDF Descargado.');
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-900 pb-safe">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[300] bg-emerald-500 text-slate-950 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 animate-fade-in font-bold text-sm">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="text-emerald-500" size={24} />
          <h1 className="text-lg font-black tracking-wider text-white">ARTIST-GEST</h1>
        </div>
        {isAuthenticated && (
          <Button variant="ghost" onClick={handleLogout} className="p-2 border border-slate-800 rounded-lg text-red-400" title="Cerrar Sesión">
            <LogOut size={16} />
          </Button>
        )}
      </header>

      {/* Main App Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6 justify-center items-stretch">
        
        {loading && !selectedProject && (
          <div className="flex flex-col items-center justify-center p-12 w-full">
            <PianoLoader size={80} />
          </div>
        )}

        {/* Login Form */}
        {!loading && !isAuthenticated && (
          <div className="max-w-md w-full mx-auto self-center">
            <Card className="p-6 border-slate-800 animate-slide-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <Music className="text-emerald-500" size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Acceso Artista</h2>
                <p className="text-xs text-slate-400">Ingresa el código de acceso exclusivo de Artist-Gest para administrar repertorios.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2.5">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Código de Seguridad</label>
                  <input 
                    type="password" 
                    value={passcode} 
                    onChange={e => setPasscode(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-3 text-white text-center font-mono text-xl tracking-widest outline-none transition-colors" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full py-3" icon={Lock}>
                  Desbloquear Panel
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Logged in views */}
        {isAuthenticated && (
          <>
            {/* Sidebar: Projects and Shows */}
            <div className="w-full lg:w-80 shrink-0 space-y-4 flex flex-col">
              
              {/* Project Selector */}
              <Card className="p-4 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5"><Folder size={12}/> Seleccionar Proyecto</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {projects.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => loadShowsForProject(p)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs font-bold ${
                        selectedProject?.id === p.id 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white' 
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900/50'
                      }`}
                    >
                      <p className="truncate">{p.name}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 truncate font-normal">{p.client}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Show Selector (Only if project selected) */}
              {selectedProject && (
                <Card className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2.5 flex items-center gap-1.5"><Music size={12}/> Shows & Ensayos</span>
                    
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 mb-4">
                      {shows.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 text-center">No hay shows creados aún en este proyecto.</p>
                      ) : (
                        shows.map((show, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                              activeShow?.name === show.name && activeShow?.date === show.date
                                ? 'bg-blue-600/10 border-blue-500/50 text-white font-bold' 
                                : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900/50'
                            }`}
                          >
                            <button 
                              className="text-left flex-1 min-w-0 mr-2"
                              onClick={() => setActiveShow(show)}
                            >
                              <p className="font-bold truncate">{show.name}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-1"><Calendar size={10}/> {show.date.split('-').reverse().join('/')}</p>
                            </button>
                            <button 
                              onClick={() => handleDeleteShow(show)} 
                              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-colors"
                              title="Eliminar Show"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Button onClick={handleCreateShow} variant="primary" className="w-full py-2.5 text-xs font-black" icon={Plus}>
                    Crear Nuevo Show
                  </Button>
                </Card>
              )}
            </div>

            {/* Editor & PDF Viewport */}
            <div className="flex-1 space-y-4">
              
              {!selectedProject && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-slate-850 bg-slate-900/10 rounded-2xl h-full min-h-[400px]">
                  <Folder size={48} className="text-slate-700 mb-3 animate-pulse" />
                  <p className="text-sm font-bold">Por favor, selecciona un proyecto técnico del panel izquierdo para comenzar.</p>
                </div>
              )}

              {selectedProject && !activeShow && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-slate-850 bg-slate-900/10 rounded-2xl h-full min-h-[400px]">
                  <Music size={48} className="text-slate-700 mb-3 animate-pulse" />
                  <p className="text-sm font-bold">Selecciona o crea un ensayo/show para ver y editar el repertorio.</p>
                </div>
              )}

              {selectedProject && activeShow && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  
                  {/* Left Column: Editor controls */}
                  <div className="space-y-4">
                    
                    {/* General Show settings */}
                    <Card className="p-4 space-y-3.5 text-left">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block border-b border-slate-850 pb-1.5">Ajustes del Show</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nombre del Show</label>
                          <input 
                            type="text" 
                            value={activeShow.name} 
                            onChange={e => {
                              const updated = { ...activeShow, name: e.target.value };
                              setActiveShow(updated);
                              setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.date === activeShow.date ? updated : s));
                            }} 
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fecha</label>
                          <input 
                            type="date" 
                            value={activeShow.date} 
                            onChange={e => {
                              const updated = { ...activeShow, date: e.target.value };
                              setActiveShow(updated);
                              setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.name === activeShow.name ? updated : s));
                            }} 
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Anotaciones Generales de Ensayo</label>
                        <textarea 
                          rows={2.5}
                          value={activeShow.notes} 
                          onChange={e => {
                            const updated = { ...activeShow, notes: e.target.value };
                            setActiveShow(updated);
                            setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.name === activeShow.name ? updated : s));
                          }} 
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none resize-none" 
                          placeholder="Requisitos de catering, observaciones generales de audio, etc."
                        />
                      </div>
                    </Card>

                    {/* Add Song form */}
                    <Card className="p-4 space-y-3 text-left">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block border-b border-slate-850 pb-1.5">Agregar Canción al Setlist</span>
                      
                      <form onSubmit={handleAddSong} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Título de la Canción</label>
                            <input 
                              type="text" 
                              value={newSongTitle} 
                              onChange={e => setNewSongTitle(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                              placeholder="Ej. Song A" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tono (Key)</label>
                            <input 
                              type="text" 
                              value={newSongKey} 
                              onChange={e => setNewSongKey(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                              placeholder="Ej. Gmin" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Ritmo (BPM)</label>
                            <input 
                              type="number" 
                              value={newSongBpm} 
                              onChange={e => setNewSongBpm(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none font-mono" 
                              placeholder="Ej. 120" 
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Anotaciones / Comentarios</label>
                            <input 
                              type="text" 
                              value={newSongNotes} 
                              onChange={e => setNewSongNotes(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                              placeholder="Ej. Intro sin guitarra, baterista marca tiempos" 
                            />
                          </div>
                        </div>

                        <Button type="submit" variant="blue" className="w-full py-2.5 text-xs font-bold" icon={Plus}>
                          Insertar Tema
                        </Button>
                      </form>
                    </Card>

                    {/* Sync and Actions */}
                    <div className="flex gap-2">
                      <Button onClick={handleSaveShow} disabled={loading} variant="primary" className="flex-1 py-3" icon={Save}>
                        {loading ? 'Guardando...' : 'Sincronizar con Esquemapps'}
                      </Button>
                      <Button onClick={downloadPDF} variant="secondary" className="px-5 py-3" icon={Download}>
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: PDF Preview / Setlist list */}
                  <div className="space-y-4">
                    {/* PDF Document Container */}
                    <div className="bg-white text-slate-900 rounded-xl p-6 shadow-2xl border border-slate-200 overflow-hidden text-left" ref={pdfRef}>
                      
                      {/* PDF Header */}
                      <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 leading-none">SETLIST DE SHOW</h2>
                          <p className="text-xs text-slate-600 font-bold mt-1 uppercase tracking-wider">Artista: {selectedProject.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-slate-900">{activeShow.date.split('-').reverse().join('/')}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 bg-slate-200 px-2 py-0.5 rounded">{activeShow.name}</p>
                        </div>
                      </div>

                      {/* PDF Notes */}
                      {activeShow.notes && (
                        <div className="mb-4 bg-slate-100 p-3 rounded border border-slate-200 text-xs">
                          <span className="font-bold text-[9px] text-slate-600 uppercase tracking-wider block mb-1">Anotaciones Generales:</span>
                          <p className="text-slate-800 whitespace-pre-wrap font-medium">{activeShow.notes}</p>
                        </div>
                      )}

                      {/* Setlist List */}
                      <div className="space-y-1">
                        <span className="font-bold text-[9px] text-slate-600 uppercase tracking-wider block mb-2">Orden de Canciones:</span>
                        
                        {activeShow.setlist.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-200 rounded">Sin temas cargados aún en el setlist.</p>
                        ) : (
                          <div className="border border-slate-200 rounded overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 border-b border-slate-200 text-[9px] uppercase tracking-wider font-bold text-slate-600">
                                <tr>
                                  <th className="p-2 w-8 text-center border-r border-slate-200">#</th>
                                  <th className="p-2 border-r border-slate-200">Canción</th>
                                  <th className="p-2 border-r border-slate-200 w-16 text-center">Tono</th>
                                  <th className="p-2 border-r border-slate-200 w-16 text-center">BPM</th>
                                  <th className="p-2">Observación de Interpretación</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeShow.setlist.map((item, idx) => (
                                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                    <td className="p-2 text-center font-bold border-r border-slate-200 bg-slate-50">{idx + 1}</td>
                                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">{item.song}</td>
                                    <td className="p-2 text-center font-mono border-r border-slate-200">{item.key || 'N/A'}</td>
                                    <td className="p-2 text-center font-mono border-r border-slate-200">{item.bpm || 'N/A'}</td>
                                    <td className="p-2 text-[10px] text-slate-600">{item.notes || 'Sin anotaciones'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* PDF Footer */}
                      <div className="border-t border-slate-200 pt-4 mt-6 flex justify-between items-center text-[8px] text-slate-400 font-mono">
                        <span>GENERADO CON ARTIST-GEST CO-LOGISTICS</span>
                        <span>© 2026 ESQUEMAS PRO</span>
                      </div>
                    </div>

                    {/* Interactive reorder panel (not printed in PDF) */}
                    {activeShow.setlist.length > 0 && (
                      <Card className="p-4 space-y-2 text-left">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block border-b border-slate-850 pb-1.5">Ordenar y Editar Setlist</span>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                          {activeShow.setlist.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-slate-950/40 p-2 rounded border border-slate-850">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-slate-500 font-bold w-4 text-right shrink-0">{idx+1}</span>
                                <span className="font-bold text-white truncate">{item.song}</span>
                                <span className="text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 px-1 rounded shrink-0">{item.key}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => moveSong(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12}/></button>
                                <button onClick={() => moveSong(idx, 1)} disabled={idx === activeShow.setlist.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12}/></button>
                                <button onClick={() => handleRemoveSong(idx)} className="p-1 text-red-500 hover:text-red-400 ml-1"><Trash2 size={12}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                  </div>

                </div>
              )}

            </div>
          </>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="text-center p-4 border-t border-slate-900 text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-6">
        © 2026 Artist-Gest Logistics Engine
      </footer>

    </div>
  );
}
