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
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  ShieldCheck,
  Link,
  Settings
} from 'lucide-react';
import { jsPDF } from 'jspdf';
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
  
  // Extract active user email from localStorage
  const storedUser = window.localStorage.getItem('artist_gest_user');
  let requesterEmail = null;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.email) requesterEmail = parsed.email;
    } catch (e) {}
  }

  const securePayload = { ...payload };
  if (requesterEmail && !securePayload.requesterEmail) {
    securePayload.requesterEmail = requesterEmail;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ app_secret: ESQUEMAS_MASTER_SECRET, action, payload: securePayload })
  });
  return response.json();
};

export default function App() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [acceptedTermsCheckbox, setAcceptedTermsCheckbox] = useState(false);
  
  // Modals and Recovery States
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverMessage, setRecoverMessage] = useState('');
  const [recoverError, setRecoverError] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');

  const [setupNewPassword, setSetupNewPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupTalla, setSetupTalla] = useState('M');
  const [setupDieta, setSetupDieta] = useState('OMNIVORA');
  const [setupDisclaimerAccepted, setSetupDisclaimerAccepted] = useState(false);
  const [setupTcAccepted, setSetupTcAccepted] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [setupSaving, setSetupSaving] = useState(false);

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
  const [newSongConnected, setNewSongConnected] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Parse query parameters for prefilling login from invitation links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const tempPassParam = params.get('tempPass');
    if (emailParam) setLoginEmail(emailParam);
    if (tempPassParam) setLoginPassword(tempPassParam);
  }, []);

  // Sync setup fields with currentUser once authenticated
  useEffect(() => {
    if (currentUser) {
      setSetupPhone(currentUser.phone || '');
      setSetupTalla(currentUser.talla || 'M');
      setSetupDieta(currentUser.dieta || 'OMNIVORA');
    }
  }, [currentUser]);

  // Check auth persistence
  useEffect(() => {
    const savedAuth = window.localStorage.getItem('artist_gest_auth');
    const savedEmail = window.localStorage.getItem('artist_gest_email');
    const savedPass = window.localStorage.getItem('artist_gest_pass');
    const savedUser = window.localStorage.getItem('artist_gest_user');

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    const autoLogin = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('login', { email: savedEmail, password: savedPass });
        if (res.status === 'success') {
          setIsAuthenticated(true);
          setCurrentUser(res.user);
          window.localStorage.setItem('artist_gest_user', JSON.stringify(res.user));
          // Directly load projects
          const projRes = await apiFetch('getProyectos');
          if (projRes.status === 'success') {
            setProjects(projRes.data || []);
          }
        } else {
          handleLogout();
        }
      } catch (e) {
        handleLogout();
      }
      setLoading(false);
    };

    if (savedAuth === 'true' && savedEmail && savedPass) {
      autoLogin();
    }
  }, []);

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (setupNewPassword !== setupConfirmPassword) {
      setSetupError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (!setupDisclaimerAccepted || !setupTcAccepted) {
      setSetupError('Debes aceptar los términos y condiciones.');
      return;
    }
    setSetupSaving(true);
    setSetupError('');
    try {
      const res = await apiFetch('updateProfile', {
        email: currentUser.email,
        phone: setupPhone,
        talla: setupTalla,
        dieta: setupDieta,
        newPassword: setupNewPassword,
        oldPassword: loginPassword || window.localStorage.getItem('artist_gest_pass') || ''
      });
      if (res.status === 'success') {
        const updatedUser = {
          ...currentUser,
          phone: setupPhone,
          talla: setupTalla,
          dieta: setupDieta,
          isTempPass: false,
          acceptedTerms: true
        };
        setCurrentUser(updatedUser);
        window.localStorage.setItem('artist_gest_user', JSON.stringify(updatedUser));
        if (setupNewPassword) {
          window.localStorage.setItem('artist_gest_pass', setupNewPassword);
        }
        showToast('¡Cuenta activada con éxito!');
        fetchProjects();
      } else {
        setSetupError(res.message || 'Error al actualizar el perfil.');
      }
    } catch(err) {
      setSetupError('Error de red al activar la cuenta.');
    }
    setSetupSaving(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await apiFetch('login', { 
        email: loginEmail, 
        password: loginPassword,
        acceptedTerms: acceptedTermsCheckbox 
      });
      if (res.status === 'success') {
        const user = res.user;
        const allowedRoles = ['ADMIN', 'MANAGER', 'TOUR_MANAGER', 'ARTISTA', 'PRODUCCION'];
        const userRole = user.role ? user.role.toUpperCase() : '';
        const baseRole = userRole.split(':')[0].trim();
        const isAllowed = allowedRoles.includes(baseRole) || (user.permisos || []).includes('PROJECTS_MANAGE');
        
        if (isAllowed) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          window.localStorage.setItem('artist_gest_auth', 'true');
          window.localStorage.setItem('artist_gest_email', loginEmail);
          window.localStorage.setItem('artist_gest_pass', loginPassword);
          window.localStorage.setItem('artist_gest_user', JSON.stringify(user));
          setLoginError('');
          showToast(`Bienvenido, ${user.name}`);
          
          // Load projects
          setProjects([]);
          const projRes = await apiFetch('getProyectos');
          if (projRes.status === 'success') {
            setProjects(projRes.data || []);
          }
        } else {
          setLoginError('Acceso denegado: Tu rol no tiene permisos de administración artística.');
        }
      } else {
        setLoginError(res.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      setLoginError('Error de red al intentar iniciar sesión.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('artist_gest_auth');
    window.localStorage.removeItem('artist_gest_email');
    window.localStorage.removeItem('artist_gest_pass');
    window.localStorage.removeItem('artist_gest_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProjects([]);
    setSelectedProject(null);
    setShows([]);
    setActiveShow(null);
    setLoginEmail('');
    setLoginPassword('');
    setAcceptedTermsCheckbox(false);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        const allProjs = res.data || [];
        const allowedRoles = ['ADMIN', 'MANAGER', 'TOUR_MANAGER', 'PRODUCCION'];
        const userBaseRole = currentUser?.role ? currentUser.role.toUpperCase().split(':')[0].trim() : '';
        const canSeeAll = allowedRoles.includes(userBaseRole);
        
        let filtered = allProjs;
        if (!canSeeAll && currentUser) {
          filtered = allProjs.filter(p => {
            const asignados = Array.isArray(p.asignados) ? p.asignados : [];
            return asignados.map(e => String(e).toLowerCase().trim()).includes(currentUser.email.toLowerCase().trim());
          });
        }
        setProjects(filtered);
        
        if (filtered.length > 0) {
          loadShowsForProject(filtered[0]);
        } else {
          loadShowsForProject({ id: 'INDEPENDENT', name: 'Shows Independientes', client: 'Sin proyecto asociado' });
        }
      } else {
        showToast('Error al cargar proyectos.');
        loadShowsForProject({ id: 'INDEPENDENT', name: 'Shows Independientes', client: 'Sin proyecto asociado' });
      }
    } catch (err) {
      showToast('Error de conexión con el servidor.');
      loadShowsForProject({ id: 'INDEPENDENT', name: 'Shows Independientes', client: 'Sin proyecto asociado' });
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
            const rProjId = parsed.proyectoId || 'INDEPENDENT';
            const isProjectMatch = rProjId === project.id;
            
            let isUserMatch = true;
            if (project.id === 'INDEPENDENT' && parsed.creadorEmail && currentUser) {
              isUserMatch = parsed.creadorEmail.toLowerCase() === currentUser.email.toLowerCase();
            }
            
            isMatch = isProjectMatch && isUserMatch && r.title.startsWith('[Setlist] ');
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
          const setlist = (parsedContent.backline || []).map(b => {
            const isNote = b.col1.startsWith('[Nota] ');
            return {
              type: isNote ? 'note' : 'song',
              song: isNote ? b.col1.replace('[Nota] ', '') : b.col1.replace(' 🔗 (Pegada)', ''),
              key: b.col3.includes('Key: ') ? b.col3.split(' | ')[0].replace('Key: ', '').trim() : (b.col3 === '━' ? '' : b.col3),
              bpm: b.col3.includes('BPM: ') ? b.col3.split(' | ')[1].replace('BPM: ', '').trim() : (b.col3 === '━' ? '' : b.col3),
              notes: b.col4 === '━' ? '' : b.col4,
              connected: b.col1.includes('🔗 (Pegada)')
            };
          });

          return {
            riderId: r.id,
            name,
            date,
            notes,
            setlist
          };
        });

        setShows(parsedShows);
        if (parsedShows.length > 0) {
          setActiveShow(parsedShows[0]);
        } else {
          const defaultShow = {
            name: 'Mi Primer Show',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            setlist: []
          };
          setShows([defaultShow]);
          setActiveShow(defaultShow);
        }
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

    const newItem = {
      type: 'song',
      song: newSongTitle.trim(),
      key: newSongKey.trim().toUpperCase() || 'N/A',
      bpm: newSongBpm.trim() || 'N/A',
      notes: newSongNotes.trim(),
      connected: newSongConnected
    };

    const updatedShow = {
      ...activeShow,
      setlist: [...activeShow.setlist, newItem]
    };

    setActiveShow(updatedShow);
    setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.name === activeShow.name ? updatedShow : s));

    // Clear inputs
    setNewSongTitle('');
    setNewSongKey('');
    setNewSongBpm('');
    setNewSongNotes('');
    setNewSongConnected(false);
  };

  const handleAddNote = (e) => {
    if (e) e.preventDefault();
    if (!newSongTitle.trim() || !activeShow) return;

    const newItem = {
      type: 'note',
      song: newSongTitle.trim(),
      key: '━',
      bpm: '━',
      notes: ''
    };

    const updatedShow = {
      ...activeShow,
      setlist: [...activeShow.setlist, newItem]
    };

    setActiveShow(updatedShow);
    setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.name === activeShow.name ? updatedShow : s));

    // Clear inputs
    setNewSongTitle('');
    setNewSongKey('');
    setNewSongBpm('');
    setNewSongNotes('');
    setNewSongConnected(false);
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
        creadorEmail: currentUser?.email || '',
        importante: activeShow.notes,
        soundcheck: "Setlist oficial del show sincronizado por Artist-Gest.",
        recordatorio: activeShow.date,
        backline: (() => {
          let songCounter = 0;
          return activeShow.setlist.map((s) => {
            const isNote = s.type === 'note';
            if (!isNote) songCounter++;
            return {
              col1: isNote ? `[Nota] ${s.song}` : s.song + (s.connected ? ' 🔗 (Pegada)' : ''),
              col2: isNote ? '━' : String(songCounter),
              col3: isNote ? '━' : `Key: ${s.key} | BPM: ${s.bpm}`,
              col4: isNote ? '━' : s.notes
            };
          });
        })(),
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
    showToast('Generando PDF nativo...');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      let y = margin;

      // Helper function to draw header on each page
      const drawHeader = () => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.text('SETLIST DE SHOW', margin, y);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text('GENERADO CON ARTIST-GEST CO-LOGISTICS', margin, y + 4);

        // Right-aligned show info
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        const dateStr = activeShow.date.split('-').reverse().join('/');
        pdf.text(dateStr, pageWidth - margin, y, { align: 'right' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        pdf.text(activeShow.name, pageWidth - margin, y + 4, { align: 'right' });

        y += 9;

        // Draw line
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.4);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;

        // Draw Project Info
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(`Artista / Proyecto: ${selectedProject.name}`, margin, y);
        y += 5;
      };

      // Initial header
      drawHeader();

      // Show Notes if present
      if (activeShow.notes) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        
        const splitNotes = pdf.splitTextToSize(activeShow.notes, contentWidth - 6);
        const notesHeight = (splitNotes.length * 3.8) + 6;

        // Check if there is enough space on this page
        if (y + notesHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          drawHeader();
        }

        // Draw note background box
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, y, contentWidth, notesHeight, 1.5, 1.5, 'FD');
        
        pdf.setTextColor(51, 65, 85);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.text('ANOTACIONES GENERALES:', margin + 3, y + 4);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 23, 42);
        
        let noteY = y + 8;
        splitNotes.forEach(line => {
          pdf.text(line, margin + 3, noteY);
          noteY += 3.8;
        });

        y += notesHeight + 5;
      }

      // Draw table headers
      const drawTableHeaders = () => {
        pdf.setFillColor(241, 245, 249); // slate-100
        pdf.rect(margin, y, contentWidth, 7, 'F');
        pdf.setDrawColor(203, 213, 225); // slate-300
        pdf.line(margin, y, pageWidth - margin, y);
        pdf.line(margin, y + 7, pageWidth - margin, y + 7);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);

        pdf.text('#', margin + 3, y + 4.5);
        pdf.text('Canción / Tema', margin + 12, y + 4.5);
        pdf.text('Tono', margin + 78, y + 4.5, { align: 'center' });
        pdf.text('BPM', margin + 98, y + 4.5, { align: 'center' });
        pdf.text('Observación de Interpretación', margin + 112, y + 4.5);
        
        y += 7;
      };

      drawTableHeaders();

      let songCounter = 0;
      activeShow.setlist.forEach((item, idx) => {
        const isNote = item.type === 'note';
        if (!isNote) songCounter++;

        // Determine row height by splitting observation notes
        const obsWidth = contentWidth - 112 - 3;
        const splitObs = pdf.splitTextToSize(item.notes || 'Sin anotaciones', obsWidth);
        const rowHeight = Math.max(7, (splitObs.length * 3.8) + 2);

        // Check page overflow
        if (y + rowHeight > pageHeight - margin - 15) {
          // Draw page footer before adding page
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text('© 2026 ESQUEMAS PRO', margin, pageHeight - 10);
          pdf.text('Página ' + pdf.getNumberOfPages(), pageWidth - margin - 20, pageHeight - 10);

          pdf.addPage();
          y = margin;
          drawHeader();
          y += 4;
          drawTableHeaders();
        }

        // Draw alternating background row for note or normal
        if (isNote) {
          pdf.setFillColor(254, 243, 199); // amber-100
          pdf.rect(margin, y, contentWidth, rowHeight, 'F');
          
          pdf.setFont('helvetica', 'bolditalic');
          pdf.setFontSize(8.5);
          pdf.setTextColor(180, 83, 9); // amber-700
          pdf.text(`[COMENTARIO] ${item.song}`, margin + 5, y + 4.5);
        } else {
          if (idx % 2 === 0) {
            pdf.setFillColor(255, 255, 255);
          } else {
            pdf.setFillColor(250, 250, 250);
          }
          pdf.rect(margin, y, contentWidth, rowHeight, 'F');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(15, 23, 42);
          pdf.text(String(songCounter), margin + 3, y + 4.5);

          // Draw song title
          let titleText = item.song;
          if (item.connected) {
            titleText += ' (Segue)';
          }
          pdf.text(titleText, margin + 12, y + 4.5);

          // Draw Key & BPM
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(30, 41, 59);
          pdf.text(item.key || 'N/A', margin + 78, y + 4.5, { align: 'center' });
          pdf.text(String(item.bpm || 'N/A'), margin + 98, y + 4.5, { align: 'center' });

          // Draw observation
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(71, 85, 105);
          
          let lineY = y + 4;
          splitObs.forEach(line => {
            pdf.text(line, margin + 112, lineY);
            lineY += 3.8;
          });
        }

        // Draw horizontal line after row
        pdf.setDrawColor(241, 245, 249);
        pdf.setLineWidth(0.2);
        pdf.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

        y += rowHeight;
      });

      // Draw final page footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text('© 2026 ESQUEMAS PRO', margin, pageHeight - 10);
      pdf.text('Página ' + pdf.getNumberOfPages() + ' de ' + pdf.getNumberOfPages(), pageWidth - margin - 25, pageHeight - 10);

      pdf.save(`Setlist_${activeShow.name.replace(/\s+/g, '_')}.pdf`);
      showToast('PDF Descargado (Nativo Vectorial).');
    } catch (err) {
      console.error(err);
      showToast('Error al generar el PDF.');
    }
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
      {isAuthenticated && (currentUser?.isTempPass || !currentUser?.acceptedTerms) && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-2xl animate-slide-up my-8 text-left">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4 text-emerald-500">
              <ShieldCheck size={28} className="shrink-0" />
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Activa tu Cuenta de Artista</h2>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
              Hola <b>{currentUser?.name}</b>, te damos la bienvenida a <b>Artist-Gest</b>. Para activar tu cuenta, debes establecer tu contraseña definitiva y aceptar el aviso de tratamiento de datos personales y sensibles de Esquemas Pro.
            </p>

            {setupError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4">
                <AlertCircle size={16} className="shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              
              {/* password fields */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-900 pb-1.5">1. Establecer Nueva Contraseña</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      value={setupNewPassword} 
                      onChange={e=>setSetupNewPassword(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none font-mono" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      value={setupConfirmPassword} 
                      onChange={e=>setSetupConfirmPassword(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none font-mono" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* profile completion fields */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-900 pb-1.5">2. Completar Datos Personales y de Ficha</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Teléfono Movil</label>
                    <input 
                      type="tel" 
                      value={setupPhone} 
                      onChange={e=>setSetupPhone(e.target.value.replace(/[^0-9+]/g, ''))} 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Talla Vestuario</label>
                    <select 
                      value={setupTalla} 
                      onChange={e=>setSetupTalla(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none animate-fade-in"
                    >
                      <option value="S">Talla S</option>
                      <option value="M">Talla M</option>
                      <option value="L">Talla L</option>
                      <option value="XL">Talla XL</option>
                      <option value="XXL">Talla XXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Tipo de Dieta</label>
                    <select 
                      value={setupDieta} 
                      onChange={e=>setSetupDieta(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none animate-fade-in"
                    >
                      <option value="OMNIVORA">OMNÍVORA</option>
                      <option value="VEGETARIANA">VEGETARIANA</option>
                      <option value="VEGANA">VEGANA</option>
                      <option value="CELIACA">CELÍACA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* terms acceptance check */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-900 pb-1">3. Políticas de Privacidad y Tratamiento de Datos</span>
                
                <div className="bg-slate-900 border border-slate-850 rounded p-2.5 text-[10px] text-slate-400 max-h-24 overflow-y-auto custom-scrollbar leading-relaxed">
                  <p className="font-bold text-slate-300 mb-0.5">AVISO DE TRATAMIENTO DE DATOS PERSONALES</p>
                  Para la operatividad en giras y shows, recopilamos tu nombre, correo, teléfono (coordinación directa y WhatsApp), talla de vestimenta (para uniformes y merch) y restricciones alimenticias (para catering). Estos datos serán tratados con total seguridad y confidencialidad.
                </div>

                <div className="space-y-2 pt-1 text-[11px] text-slate-300">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={setupDisclaimerAccepted} 
                      onChange={e => setSetupDisclaimerAccepted(e.target.checked)} 
                      className="accent-emerald-500 rounded bg-slate-900 border-slate-700 mt-0.5" 
                      required 
                    />
                    <span>Acepto el tratamiento de mis datos personales y de ficha para logística.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={setupTcAccepted} 
                      onChange={e => setSetupTcAccepted(e.target.checked)} 
                      className="accent-emerald-500 rounded bg-slate-900 border-slate-700 mt-0.5" 
                      required 
                    />
                    <span>He leído y acepto los Términos y Condiciones y la Política de Privacidad de la plataforma.</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  className="flex-1 bg-slate-800 py-2.5 text-xs font-bold text-slate-400 hover:text-red-400" 
                  onClick={handleLogout}
                >
                  Cancelar / Salir
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-[2] py-2.5 text-xs font-bold uppercase tracking-wider" 
                  disabled={setupSaving}
                >
                  {setupSaving ? 'Guardando...' : 'Aceptar y Activar Cuenta'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* Header bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="text-emerald-500" size={24} />
          <h1 className="text-lg font-black tracking-wider text-white">ARTIST-GEST</h1>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setProfilePhone(currentUser?.phone || '');
                setProfileOldPassword('');
                setProfileNewPassword('');
                setProfileConfirmPassword('');
                setProfileError('');
                setShowProfileModal(true);
              }} 
              className="py-1.5 px-3 border-slate-700 text-xs font-bold"
              icon={User}
            >
              Mi Perfil
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="p-2 border border-slate-800 rounded-lg text-red-400" title="Cerrar Sesión">
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </header>

      {/* Temporary Password Banner */}
      {isAuthenticated && currentUser?.isTempPass && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-md">
          <AlertCircle size={16} className="shrink-0" />
          <span>Estás usando una contraseña temporal. Por seguridad, por favor actualízala en la sección "Mi Perfil" a la brevedad.</span>
          <button 
            onClick={() => {
              setProfilePhone(currentUser?.phone || '');
              setProfileOldPassword('');
              setProfileNewPassword('');
              setProfileConfirmPassword('');
              setProfileError('');
              setShowProfileModal(true);
            }} 
            className="underline ml-2 hover:text-slate-900 transition-colors font-black cursor-pointer"
          >
            Ir a Mi Perfil
          </button>
        </div>
      )}

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

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2.5">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none transition-colors" 
                    placeholder="nombre@correo.com" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Contraseña</label>
                  <input 
                    type="password" 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none transition-colors font-mono" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
                
                {/* Use of Information Policy Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="acceptTerms"
                    checked={acceptedTermsCheckbox} 
                    onChange={e => setAcceptedTermsCheckbox(e.target.checked)} 
                    className="mt-0.5 w-3.5 h-3.5 bg-slate-950 border border-slate-800 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950 accent-emerald-500 cursor-pointer shrink-0" 
                    required 
                  />
                  <label htmlFor="acceptTerms" className="text-[10px] text-slate-400 cursor-pointer leading-tight selection:bg-transparent">
                    Acepto el uso y tratamiento de mi información personal conforme a las políticas de privacidad.
                  </label>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button 
                    type="button" 
                    onClick={() => {
                      setRecoverEmail('');
                      setRecoverMessage('');
                      setRecoverError('');
                      setShowRecoverModal(true);
                    }}
                    className="text-emerald-500 hover:underline cursor-pointer font-bold"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button type="submit" className="w-full py-3" disabled={loading} icon={Lock}>
                  {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
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
              
              {/* Project Selector (only visible if there are projects assigned) */}
              {projects.length > 0 && (
                <Card className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1 shrink-0">
                      <Folder size={12}/> Proyecto
                    </span>
                    <select
                      value={selectedProject?.id || ''}
                      onChange={(e) => {
                        const p = projects.find(proj => proj.id === e.target.value);
                        if (p) loadShowsForProject(p);
                        else if (e.target.value === 'INDEPENDENT') {
                          loadShowsForProject({ id: 'INDEPENDENT', name: 'Shows Independientes', client: 'Sin proyecto asociado' });
                        }
                      }}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-emerald-500 max-w-[180px] truncate"
                    >
                      <option value="INDEPENDENT">Independiente (Sin Proyecto)</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              )}

              {/* Show Selector (Only if project selected) */}
              {selectedProject && (
                <Card className="p-3 space-y-2 relative">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-850 pb-1.5">
                    <span className="flex items-center gap-1"><Music size={12}/> Shows & Ensayos</span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={handleCreateShow}
                        className="p-1 text-emerald-500 hover:text-emerald-400 bg-slate-950 border border-slate-800 rounded transition-colors"
                        title="Crear Nuevo Show"
                      >
                        <Plus size={12} />
                      </button>
                      {activeShow && (
                        <>
                          <button 
                            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                            className={`p-1 border rounded transition-colors ${
                              showSettingsDropdown 
                                ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' 
                                : 'text-slate-400 hover:text-white bg-slate-950 border-slate-800'
                            }`}
                            title="Ajustes del Show"
                          >
                            <Settings size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteShow(activeShow)} 
                            className="p-1 text-red-500 hover:text-red-400 bg-slate-950 border border-slate-800 rounded transition-colors"
                            title="Eliminar Show Activo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={activeShow ? `${activeShow.name}|||${activeShow.date}` : ''}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setActiveShow(null);
                        } else {
                          const [name, date] = e.target.value.split('|||');
                          const show = shows.find(s => s.name === name && s.date === date);
                          if (show) setActiveShow(show);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="">-- Seleccionar Show --</option>
                      {shows.map((show, idx) => (
                        <option key={idx} value={`${show.name}|||${show.date}`}>
                          {show.name} ({show.date.split('-').reverse().slice(0, 2).join('/')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {shows.length > 0 && (
                    <div className="mt-3 border-t border-slate-800/80 pt-3 space-y-2 text-left">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Acceso Rápido a Setlists</p>
                      <div className="space-y-1 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                        {shows.map((show, idx) => {
                          const isActive = activeShow && activeShow.name === show.name && activeShow.date === show.date;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveShow(show)}
                              className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs transition-all duration-150 border ${
                                isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold shadow-md shadow-emerald-950/20' 
                                  : 'text-slate-400 hover:text-white bg-slate-950/40 border-transparent hover:bg-slate-850/50'
                              }`}
                            >
                              <span className="truncate flex-1 font-bold">{show.name}</span>
                              <span className="font-mono text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80 shrink-0 ml-2">
                                {show.date.split('-').reverse().slice(0, 2).join('/')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Floating Show Settings Popover (Ajustes del Show) */}
                  {activeShow && showSettingsDropdown && (
                    <div className="absolute left-full top-0 ml-3 z-50 w-72 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3 animate-fadeIn text-left">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block border-b border-slate-850 pb-1">⚙️ Configuración del Show</span>
                      
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
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded p-2 text-xs text-white outline-none" 
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fecha del Show</label>
                        <input 
                          type="date" 
                          value={activeShow.date} 
                          onChange={e => {
                            const updated = { ...activeShow, date: e.target.value };
                            setActiveShow(updated);
                            setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.name === activeShow.name ? updated : s));
                          }} 
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded p-2 text-xs text-white outline-none" 
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Anotaciones Generales / Catering</label>
                        <textarea 
                          rows={3}
                          value={activeShow.notes} 
                          onChange={e => {
                            const updated = { ...activeShow, notes: e.target.value };
                            setActiveShow(updated);
                            setShows(prev => prev.map(s => s.riderId === activeShow.riderId && s.name === activeShow.name ? updated : s));
                          }} 
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded p-2 text-xs text-white outline-none resize-none" 
                          placeholder="Requisitos de catering, sonido, etc."
                        />
                      </div>
                    </div>
                  )}
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
                    <Card className="p-4 space-y-3.5 text-left">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block border-b border-slate-850 pb-1.5">Agregar al Setlist</span>
                      
                      <form onSubmit={handleAddSong} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Título de la Canción o Texto de la Nota</label>
                            <input 
                              type="text" 
                              value={newSongTitle} 
                              onChange={e => setNewSongTitle(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                              placeholder="Ej. Canción de entrada, o conversación con público" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tono (Key) <span className="text-[8px] text-slate-500 font-normal">(Sólo Canción)</span></label>
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
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Ritmo (BPM) <span className="text-[8px] text-slate-500 font-normal">(Sólo Canción)</span></label>
                            <input 
                              type="number" 
                              value={newSongBpm} 
                              onChange={e => setNewSongBpm(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none font-mono" 
                              placeholder="Ej. 120" 
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Observaciones <span className="text-[8px] text-slate-500 font-normal">(Sólo Canción)</span></label>
                            <input 
                              type="text" 
                              value={newSongNotes} 
                              onChange={e => setNewSongNotes(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded p-2 text-xs text-white outline-none" 
                              placeholder="Ej. Intro sin guitarra" 
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1.5 border-t border-slate-850">
                          <input 
                            type="checkbox" 
                            id="connectedNext"
                            checked={newSongConnected}
                            onChange={e => setNewSongConnected(e.target.checked)}
                            className="accent-emerald-500 rounded bg-slate-950 border-slate-800 w-3.5 h-3.5 cursor-pointer shrink-0" 
                          />
                          <label htmlFor="connectedNext" className="text-[10px] text-slate-400 cursor-pointer select-none leading-none">
                            🔗 Esta canción va pegada a la siguiente (sin pausa)
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <button 
                            type="submit" 
                            className="w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                          >
                            <Plus size={14} className="stroke-[3]" /> Insertar Canción
                          </button>
                          <button 
                            type="button" 
                            onClick={handleAddNote}
                            className="w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                          >
                            <Plus size={14} className="stroke-[3]" /> Insertar Nota / Intermedio
                          </button>
                        </div>
                      </form>
                    </Card>

                    {/* Sync and Actions */}
                    <div className="flex gap-2">
                      {selectedProject?.id !== 'INDEPENDENT' ? (
                        <Button onClick={handleSaveShow} disabled={loading} variant="primary" className="flex-1 py-3" icon={Save}>
                          {loading ? 'Sincronizando...' : 'Sincronizar con Esquemapps'}
                        </Button>
                      ) : (
                        <Button onClick={handleSaveShow} disabled={loading} variant="primary" className="flex-1 py-3" icon={Save}>
                          {loading ? 'Guardando...' : 'Guardar Show'}
                        </Button>
                      )}
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
                                {(() => {
                                  let songCounter = 0;
                                  return activeShow.setlist.map((item, idx) => {
                                    const isNote = item.type === 'note';
                                    if (!isNote) songCounter++;
                                    
                                    if (isNote) {
                                      return (
                                        <tr key={idx} className="border-b border-slate-200 bg-amber-500/5">
                                          <td colSpan={5} className="p-2.5 text-xs font-semibold text-slate-800 italic border-l-4 border-l-amber-500">
                                            {item.song}
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return (
                                      <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                        <td className="p-2 text-center font-bold border-r border-slate-200 bg-slate-50">{songCounter}</td>
                                        <td className="p-2 border-r border-slate-200">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-900">{item.song}</span>
                                            {item.connected && (
                                              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded border border-blue-200">
                                                <Link size={8} className="shrink-0" /> SEGUE
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="p-2 text-center font-mono border-r border-slate-200">{item.key || 'N/A'}</td>
                                        <td className="p-2 text-center font-mono border-r border-slate-200">{item.bpm || 'N/A'}</td>
                                        <td className="p-2 text-[10px] text-slate-600">{item.notes || 'Sin anotaciones'}</td>
                                      </tr>
                                    );
                                  });
                                })()}
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
                          {activeShow.setlist.map((item, idx) => {
                            const isNote = item.type === 'note';
                            return (
                              <div key={idx} className={`flex justify-between items-center text-xs p-2 rounded border relative overflow-hidden ${
                                isNote 
                                  ? 'bg-slate-900/40 border-slate-800 border-dashed text-slate-300' 
                                  : 'bg-slate-950/40 border-slate-850 text-white'
                              }`}>
                                {isNote && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                                )}
                                <div className="flex items-center gap-2 truncate pl-2">
                                  <span className="font-mono text-slate-500 font-bold w-4 text-right shrink-0">{idx+1}</span>
                                  {isNote ? (
                                    <span className="font-semibold italic truncate">{item.song}</span>
                                  ) : (
                                    <>
                                      <span className="font-bold truncate">{item.song}</span>
                                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-blue-400 px-1 rounded shrink-0 font-mono">{item.key}</span>
                                      {item.connected && (
                                        <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 rounded font-black uppercase shrink-0">🔗 SEGUE</span>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => moveSong(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12}/></button>
                                  <button onClick={() => moveSong(idx, 1)} disabled={idx === activeShow.setlist.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12}/></button>
                                  <button onClick={() => handleRemoveSong(idx)} className="p-1 text-red-500 hover:text-red-400 ml-1"><Trash2 size={12}/></button>
                                </div>
                              </div>
                            );
                          })}
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

      {/* --- PROFILE MODAL --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User size={18} className="text-emerald-500" />
                Mi Perfil
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Nombre</label>
                <input 
                  type="text" 
                  value={currentUser?.name || ''} 
                  disabled 
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-400 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                <input 
                  type="text" 
                  value={currentUser?.email || ''} 
                  disabled 
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-400 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Teléfono</label>
                <input 
                  type="text" 
                  value={profilePhone} 
                  onChange={e => setProfilePhone(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none transition-colors"
                  placeholder="+56912345678"
                />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Cambiar Contraseña</h4>
                {profileError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-[11px] p-2.5 rounded-lg mb-3 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Contraseña Actual</label>
                    <input 
                      type="password" 
                      value={profileOldPassword} 
                      onChange={e => setProfileOldPassword(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none transition-colors font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      value={profileNewPassword} 
                      onChange={e => setProfileNewPassword(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none transition-colors font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                    <input 
                      type="password" 
                      value={profileConfirmPassword} 
                      onChange={e => setProfileConfirmPassword(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none transition-colors font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-800 pt-3">
              <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  setProfileError('');
                  if (profileNewPassword || profileOldPassword) {
                    if (!profileOldPassword) {
                      setProfileError('Debes ingresar tu contraseña actual.');
                      return;
                    }
                    if (profileNewPassword.length < 6) {
                      setProfileError('La nueva contraseña debe tener al menos 6 caracteres.');
                      return;
                    }
                    if (profileNewPassword !== profileConfirmPassword) {
                      setProfileError('Las nuevas contraseñas no coinciden.');
                      return;
                    }
                  }
                  
                  setLoading(true);
                  try {
                    const res = await apiFetch('updateProfile', {
                      email: currentUser.email,
                      phone: profilePhone,
                      talla: currentUser.talla,
                      dieta: currentUser.dieta,
                      oldPassword: profileOldPassword || undefined,
                      newPassword: profileNewPassword || undefined
                    });
                    
                    if (res.status === 'success') {
                      showToast('Perfil actualizado con éxito.');
                      
                      // Update current user details
                      const updatedUser = { 
                        ...currentUser, 
                        phone: profilePhone,
                        isTempPass: (profileNewPassword && profileOldPassword) ? false : currentUser.isTempPass 
                      };
                      setCurrentUser(updatedUser);
                      window.localStorage.setItem('artist_gest_user', JSON.stringify(updatedUser));
                      
                      // If password changed, update saved credentials
                      if (profileNewPassword && profileOldPassword) {
                        window.localStorage.setItem('artist_gest_pass', profileNewPassword);
                      }
                      
                      setShowProfileModal(false);
                    } else {
                      setProfileError(res.message || 'Error al actualizar el perfil.');
                    }
                  } catch (err) {
                    setProfileError('Error de conexión con el servidor.');
                  }
                  setLoading(false);
                }}
                disabled={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECOVER PASSWORD MODAL --- */}
      {showRecoverModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-emerald-500" />
                Recuperar Contraseña
              </h3>
              <button 
                onClick={() => {
                  setShowRecoverModal(false);
                  setRecoverEmail('');
                  setRecoverMessage('');
                  setRecoverError('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Ingresa tu correo electrónico registrado. Si coincide con una cuenta activa, te enviaremos un token temporal para que puedas volver a ingresar.
              </p>

              {recoverMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{recoverMessage}</span>
                </div>
              )}

              {recoverError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{recoverError}</span>
                </div>
              )}

              {!recoverMessage && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={recoverEmail} 
                    onChange={e => setRecoverEmail(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none transition-colors"
                    placeholder="nombre@correo.com"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-800 pt-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowRecoverModal(false);
                  setRecoverEmail('');
                  setRecoverMessage('');
                  setRecoverError('');
                }}
              >
                Cerrar
              </Button>
              {!recoverMessage && (
                <Button 
                  onClick={async () => {
                    setRecoverError('');
                    setRecoverMessage('');
                    if (!recoverEmail) {
                      setRecoverError('Por favor ingresa tu correo electrónico.');
                      return;
                    }
                    setLoading(true);
                    try {
                      const res = await apiFetch('recuperarClave', { email: recoverEmail });
                      if (res.status === 'success') {
                        setRecoverMessage(res.message || 'Se ha enviado un token temporal a tu correo electrónico.');
                      } else {
                        setRecoverError(res.message || 'No se pudo procesar la solicitud.');
                      }
                    } catch (err) {
                      setRecoverError('Error de conexión con el servidor.');
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                >
                  Enviar Instrucciones
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
