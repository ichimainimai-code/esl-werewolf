import React, { useState, useEffect, useRef } from 'react';
import { Settings, Moon, Sun, Shield, Eye, Skull, ChevronRight, Check, X, AlertCircle, Download, Loader2 } from 'lucide-react';

// --- GOOGLE SHEETS INTEGRATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzK2Alv6Yuz5N7pYIhOV3ClqEA9OvNtTuDJGup5GtkxO5cnpfGrNM_nZlrUQ6qaV1XKCQ/exec";

// --- BILINGUAL DICTIONARY ---
const TEXT = {
  tutorial_title: { en: "The Village", jp: "村" },
  tutorial_1: { en: "Welcome to the village. By day, you are peaceful citizens practicing your English.", jp: "村へようこそ。昼間、あなたたちは英語を練習する平和な市民です。" },
  tutorial_2: { en: "But at night, the Werewolves awaken. They will secretly eliminate one player.", jp: "しかし夜になると、人狼が目覚めます。彼らは密かに一人のプレイヤーを排除します。" },
  tutorial_3: { en: "During the day, you must debate in English to find the Werewolves and vote them out. Good luck.", jp: "昼間は英語で議論し、人狼を見つけ出して投票で追放しなければなりません。幸運を。" },
  enter_village: { en: "Enter Village", jp: "村に入る" },
  setup_title: { en: "Add Players", jp: "プレイヤーを追加" },
  start_game: { en: "Start Game", jp: "ゲーム開始" },
  day_phase: { en: "Day Phase", jp: "昼のフェーズ" },
  night_phase: { en: "Night Phase", jp: "夜のフェーズ" },
  pass_device: { en: "Pass the device to", jp: "デバイスを渡す：" },
  im_ready: { en: "I am ready", jp: "準備完了" },
  decoy_prompt: { en: "What are you doing tonight?", jp: "今夜は何をしていますか？" },
  decoy_1: { en: "Reading a book", jp: "本を読んでいる" },
  decoy_2: { en: "Sleeping deeply", jp: "深く眠っている" },
  decoy_3: { en: "Eating a snack", jp: "おやつを食べている" },
  wolf_prompt_dyn: { en: "Select {n} players:", jp: "{n}人のプレイヤーを選択してください：" },
  wolf_prompt_final: { en: "Select the final target:", jp: "最終ターゲットを選択してください：" },
  wolf_prompt_solo: { en: "Select a player to eliminate:", jp: "排除するプレイヤーを選択してください：" },
  seer_prompt: { en: "Select a player to check:", jp: "確認するプレイヤーを選択してください：" },
  watchman_prompt: { en: "Look up at the classroom for 5 seconds. Who looks nervous?", jp: "5秒間教室を見渡してください。誰が緊張しているように見えますか？" },
  next: { en: "Next", jp: "次へ" },
  debate_title: { en: "Debate & Accuse", jp: "議論と告発" },
  vote_btn: { en: "Begin Voting", jp: "投票を開始する" },
  vote_prompt: { en: "Who does the village eliminate?", jp: "村は誰を追放しますか？" },
  confirm_vote: { en: "Confirm Vote", jp: "投票を確定" },
  role_villager: { en: "You are a Villager.", jp: "あなたは村人です。" },
  role_werewolf: { en: "You are a Werewolf.", jp: "あなたは人狼です。" },
  role_seer: { en: "You are the Seer.", jp: "あなたは占い師です。" },
  role_watchman: { en: "You are the Night Watchman.", jp: "あなたは夜警です。" },
  other_wolves: { en: "Your fellow wolves are: ", jp: "仲間の人狼は：" },
  morning_title: { en: "Sunrise", jp: "夜明け" },
  morning_desc: { en: "It is morning. Everyone gather in the village hall.", jp: "朝になりました。村民は集会所に集まってください。" },
  gather_btn: { en: "Gather in the Hall", jp: "集会所に集まる" },
  vote_result_title: { en: "The Verdict", jp: "判決" },
  vote_innocent: { en: "You eliminated an innocent Villager.", jp: "罪のない村人を追放しました。" },
  vote_werewolf: { en: "You eliminated a Werewolf!", jp: "人狼を追放しました！" },
  tut_roles_title: { en: "Roles", jp: "役職" },
  tut_role_villager: { en: "Villager: Try to find the Werewolves during the day.", jp: "村人：昼間に議論をして人狼を見つけ出します。" },
  tut_role_werewolf: { en: "Werewolf: Secretly eliminate villagers at night.", jp: "人狼：夜に密かに村人を排除します。" },
  tut_role_seer: { en: "Seer: Check one player's true identity each night.", jp: "占い師：毎夜、一人のプレイヤーの正体を確認できます。" },
  tut_role_watchman: { en: "Night Watchman: Briefly observe the classroom during the night to catch suspicious behavior.", jp: "夜警：夜に数秒間だけ教室を見渡し、怪しい行動を観察します。" },
  tut_phases_title: { en: "How to Play", jp: "遊び方" },
  tut_phase_night: { en: "Night Phase: Pass the device. Everyone performs their secret actions.", jp: "夜のフェーズ：端末を順番に回し、各自が密かに行動します。" },
  tut_phase_day: { en: "Day Phase: Discuss in English to find the Werewolves, then vote to eliminate one suspect.", jp: "昼のフェーズ：英語で議論し、怪しい人に投票して追放します。" },
  tut_win_title: { en: "How to Win", jp: "勝利条件" },
  tut_win_villagers: { en: "Villagers Win: Eliminate all Werewolves.", jp: "村人陣営の勝利：すべての人狼を追放する。" },
  tut_win_werewolves: { en: "Werewolves Win: Survive until Werewolves equal the number of Villagers.", jp: "人狼陣営の勝利：生存数が村人と同じ数になる。" },
  load_roster: { en: "Load Class Roster", jp: "クラス名簿を読み込む" }
};

// --- PRESET AVATARS ---
const AVATARS = ['🧑','👱','🧔','👩','👱‍♀️','👴','👲','🧕','👨‍🦱','👩‍🦰','🧛','🧙','🧚','🧝','🧞','🧟','🤴','👸','💂','🕵️'];

export default function App() {
  // --- STATE ---
  const [gameState, setGameState] = useState('TUTORIAL'); 
  const [lang, setLang] = useState('en');
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  
  // Game Loop State
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [nightActions, setNightActions] = useState({ wolfNominations: [], finalWolfTarget: null, seerCheck: null });
  const [lastKilled, setLastKilled] = useState(null);
  const [winner, setWinner] = useState(null);
  const [selectedTargets, setSelectedTargets] = useState([]);

  // Dashboard State
  const [showDashboard, setShowDashboard] = useState(false);
  const [overrideWolfCount, setOverrideWolfCount] = useState(0);
  const pressTimer = useRef(null);

  // --- HELPER FUNCTIONS ---
  const t = (key) => TEXT[key][lang] || TEXT[key]['en'];

  // Dashboard long-press logic
  const handleTouchStart = () => pressTimer.current = setTimeout(() => setShowDashboard(true), 2000);
  const handleTouchEnd = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  // --- GOOGLE SHEETS FUNCTIONS ---
  const fetchRoster = async () => {
    if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_GOOGLE_SCRIPT_URL_HERE")) {
      alert("Please add your Google Script URL to the code first!");
      return;
    }
    
    setIsLoadingRoster(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const result = await response.json();
      
      if (result.status === 'success') {
        const rosterPlayers = result.data.map((student, index) => ({
          id: student.ID || Date.now() + index,
          name: student.Name,
          avatar: student.DefaultAvatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
          role: null,
          isAlive: true
        }));
        setPlayers([...players, ...rosterPlayers]);
      }
    } catch (error) {
      console.error("Failed to load roster:", error);
      alert("Error loading roster. Check your internet connection or URL.");
    }
    setIsLoadingRoster(false);
  };

  const logGameResult = (winnerTeam, currentPlayers) => {
    if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_GOOGLE_SCRIPT_URL_HERE")) return;

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'logGame',
        winner: winnerTeam,
        details: {
          players: currentPlayers.map(p => ({ name: p.name, role: p.role }))
        }
      })
    }).catch(err => console.error("Failed to log game:", err));
  };

  const getDefaultWolfCount = () => {
    if (players.length >= 12) return 4;
    if (players.length >= 9) return 3;
    if (players.length >= 6) return 2;
    return 1;
  };

  const updatePlayerRole = (id, newRole) => {
    setPlayers(players.map(p => p.id === id ? { ...p, role: newRole === 'auto' ? null : newRole } : p));
  };

  const assignRoles = () => {
    let targetWolves = overrideWolfCount > 0 ? overrideWolfCount : getDefaultWolfCount();
    
    const preAssigned = players.filter(p => p.role !== null);
    const unassigned = players.filter(p => p.role === null);
    
    const assignedWolves = preAssigned.filter(p => p.role === 'werewolf').length;
    const assignedSeer = preAssigned.filter(p => p.role === 'seer').length;
    const assignedWatchman = preAssigned.filter(p => p.role === 'watchman').length;
    
    let rolesToDeal = [];
    const wolvesNeeded = Math.max(0, targetWolves - assignedWolves);
    for(let i=0; i<wolvesNeeded; i++) rolesToDeal.push('werewolf');
    
    if (assignedSeer === 0) rolesToDeal.push('seer');
    if (assignedWatchman === 0) rolesToDeal.push('watchman');
    
    while (rolesToDeal.length < unassigned.length) rolesToDeal.push('villager');
    
    rolesToDeal = rolesToDeal.slice(0, unassigned.length);
    rolesToDeal.sort(() => Math.random() - 0.5); // Shuffle
    
    let dealIndex = 0;
    const assignedPlayers = players.map(p => {
      if (p.role !== null) return { ...p, isAlive: true };
      return { ...p, role: rolesToDeal[dealIndex++], isAlive: true };
    });
    
    setPlayers(assignedPlayers);
    startNightPhase(assignedPlayers);
  };

  const addPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setPlayers([...players, { 
      id: Date.now(), name: newPlayerName, avatar: selectedAvatar, role: null, isAlive: true
    }]);
    setNewPlayerName('');
    setSelectedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]); 
  };

  const startNightPhase = (currentPlayers = players) => {
    let firstIndex = 0;
    while (firstIndex < currentPlayers.length && !currentPlayers[firstIndex].isAlive) firstIndex++;
    
    setCurrentPlayerIndex(firstIndex);
    setGameState('NIGHT_PASS');
    setNightActions({ wolfNominations: [], finalWolfTarget: null, seerCheck: null });
    setSelectedTargets([]);
  };

  const nextNightTurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    
    if (selectedTargets.length > 0) {
      if (currentPlayer.role === 'werewolf') {
        setNightActions(prev => ({ 
          ...prev, 
          wolfNominations: selectedTargets,
          finalWolfTarget: selectedTargets.length === 1 ? selectedTargets[0] : null
        }));
      }
      if (currentPlayer.role === 'seer') setNightActions(prev => ({ ...prev, seerCheck: selectedTargets[0] }));
    }
    
    setSelectedTargets([]);
    
    let nextIndex = currentPlayerIndex + 1;
    while (nextIndex < players.length && !players[nextIndex].isAlive) {
      nextIndex++;
    }

    if (nextIndex >= players.length) {
      processNightEnd();
    } else {
      setCurrentPlayerIndex(nextIndex);
      setGameState('NIGHT_PASS');
    }
  };

  const processNightEnd = () => {
    let killedId = nightActions.finalWolfTarget || (nightActions.wolfNominations.length > 0 ? nightActions.wolfNominations[0] : null);
    let updatedPlayers = [...players];
    
    if (killedId) {
      updatedPlayers = updatedPlayers.map(p => p.id === killedId ? { ...p, isAlive: false } : p);
      setLastKilled(updatedPlayers.find(p => p.id === killedId));
    } else {
      setLastKilled(null);
    }
    
    setPlayers(updatedPlayers);
    checkWinCondition(updatedPlayers, 'MORNING_TRANSITION');
  };

  const processDayVote = () => {
    if (selectedTargets.length === 0 || selectedTargets[0] === 'done') return;
    let targetId = selectedTargets[0];
    let updatedPlayers = players.map(p => p.id === targetId ? { ...p, isAlive: false } : p);
    setLastKilled(updatedPlayers.find(p => p.id === targetId));
    setPlayers(updatedPlayers);
    setSelectedTargets([]);
    setGameState('VOTE_RESULT');
  };

  const checkWinCondition = (currentPlayers, nextState) => {
    const alivePlayers = currentPlayers.filter(p => p.isAlive);
    const aliveWolves = alivePlayers.filter(p => p.role === 'werewolf').length;
    const aliveVillagers = alivePlayers.length - aliveWolves;

    if (aliveWolves === 0) {
      setWinner('VILLAGERS');
      logGameResult('VILLAGERS', currentPlayers); 
      setGameState('VICTORY');
    } else if (aliveWolves >= aliveVillagers) {
      setWinner('WEREWOLVES');
      logGameResult('WEREWOLVES', currentPlayers); 
      setGameState('VICTORY');
    } else {
      if (nextState === 'NIGHT_TRANSITION') {
        startNightPhase(currentPlayers);
      } else {
        setGameState(nextState);
      }
    }
  };

  const handleTargetToggle = (id, maxSelections = 1) => {
    if (maxSelections === 1) {
      setSelectedTargets([id]);
    } else {
      if (selectedTargets.includes(id)) {
        setSelectedTargets(selectedTargets.filter(t => t !== id));
      } else if (selectedTargets.length < maxSelections) {
        setSelectedTargets([...selectedTargets, id]);
      }
    }
  };

  // --- RENDER HELPERS ---
  const ScrollContainer = ({ children, phase }) => {
    const isDay = phase === 'MORNING_TRANSITION' || phase === 'DAY_REVEAL' || phase === 'DAY_DEBATE' || phase === 'DAY_VOTE' || phase === 'VOTE_RESULT';
    const bgClass = isDay ? "bg-amber-100" : "bg-stone-950";
    
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 relative overflow-hidden font-serif transition-colors duration-700`}>
        {/* Inject CSS Animations explicitly with movement to make it obvious */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes flicker {
            0%, 100% { opacity: 0.3; transform: scale(1) translate(0px, 0px); }
            33% { opacity: 0.8; transform: scale(1.1) translate(20px, -20px); }
            66% { opacity: 0.4; transform: scale(0.95) translate(-20px, 10px); }
          }
          @keyframes flicker-fast {
            0% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.05); }
            100% { opacity: 0.5; transform: scale(0.95); }
          }
          .animate-flicker { animation: flicker 3s ease-in-out infinite alternate; }
          .animate-flicker-fast { animation: flicker-fast 0.3s ease-in-out infinite alternate; }
        `}} />
        
        {!isDay && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/60 rounded-full blur-[80px] animate-flicker pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-yellow-500/50 rounded-full blur-[100px] animate-flicker-fast pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}
        {isDay && (
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/40 rounded-full blur-[100px] pointer-events-none"></div>
        )}

        <div className="bg-[#f4e4bc] w-full max-w-2xl min-h-[85vh] p-6 md:p-10 rounded-sm shadow-[inset_0_0_40px_rgba(139,69,19,0.3),0_15px_40px_rgba(0,0,0,0.6)] relative z-10 border-4 border-[#d4c49c] flex flex-col">
           {phase !== 'VICTORY' && phase !== 'NIGHT_PASS' && (
             <button onClick={() => setLang(lang === 'en' ? 'jp' : 'en')} className="absolute -top-4 -right-4 w-16 h-16 bg-red-800 rounded-full shadow-lg flex items-center justify-center text-white font-bold border-2 border-red-950 transform transition hover:scale-105 z-50">
               {lang === 'en' ? 'EN' : 'JP'}
             </button>
           )}
           {children}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!showDashboard) return null;
    return (
      <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col p-4 md:p-8 text-white overflow-y-auto font-sans">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2"><AlertCircle /> Teacher Dashboard</h2>
          <button onClick={() => setShowDashboard(false)} className="p-2 bg-stone-800 rounded-full hover:bg-stone-700"><X /></button>
        </div>
        
        {gameState === 'SETUP' && (
          <div className="bg-stone-900 rounded-xl p-4 mb-6">
            <h3 className="text-red-400 font-bold mb-4 uppercase tracking-wider text-sm border-b border-stone-800 pb-2">Game Settings</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-300">Total Werewolves:</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setOverrideWolfCount(Math.max(1, (overrideWolfCount || getDefaultWolfCount()) - 1))} className="bg-stone-700 w-8 h-8 rounded flex items-center justify-center font-bold hover:bg-stone-600">-</button>
                <span className="font-bold w-8 text-center text-xl">{overrideWolfCount || getDefaultWolfCount()}</span>
                <button onClick={() => setOverrideWolfCount((overrideWolfCount || getDefaultWolfCount()) + 1)} className="bg-stone-700 w-8 h-8 rounded flex items-center justify-center font-bold hover:bg-stone-600">+</button>
                <div className="w-16">
                  {overrideWolfCount > 0 && <button onClick={() => setOverrideWolfCount(0)} className="text-xs text-stone-400 underline hover:text-white">Auto</button>}
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2 italic">Auto adjusts wolves based on player count. Manual role assignments below will override this if they exceed the target.</p>
          </div>
        )}

        <div className="bg-stone-900 rounded-xl p-4 mb-6 flex-1 overflow-y-auto">
          <p className="text-sm text-stone-400 mb-4">Current Phase: {gameState}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((p) => (
              <div key={p.id} className={`flex justify-between items-center p-3 rounded ${p.isAlive ? 'bg-stone-800' : 'bg-red-900/30 text-stone-500'}`}>
                <div className="flex items-center gap-2"><span>{p.avatar}</span><span className="font-bold">{p.name}</span></div>
                <div className="flex items-center gap-4">
                  {gameState === 'SETUP' ? (
                    <select 
                      value={p.role || 'auto'}
                      onChange={(e) => updatePlayerRole(p.id, e.target.value)}
                      className="bg-stone-700 text-white text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer"
                    >
                      <option value="auto">AUTO</option>
                      <option value="villager">Villager</option>
                      <option value="werewolf">Werewolf</option>
                      <option value="seer">Seer</option>
                      <option value="watchman">Watchman</option>
                    </select>
                  ) : (
                    <span className="uppercase text-xs font-bold px-2 py-1 bg-stone-700 rounded">{p.role || 'AUTO'}</span>
                  )}
                  {!p.isAlive && gameState !== 'SETUP' && <Skull size={16} className="text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 mt-auto">
          <button onClick={() => { setShowDashboard(false); setGameState('DAY_DEBATE'); }} className="flex-1 bg-blue-600 py-3 rounded font-bold">Force Day Phase</button>
          <button onClick={() => { setPlayers([]); setOverrideWolfCount(0); setGameState('SETUP'); setShowDashboard(false); }} className="flex-1 bg-red-600 py-3 rounded font-bold">Reset Game</button>
        </div>
      </div>
    );
  };

  // --- RENDER BLOCKS ---

  if (gameState === 'TUTORIAL') {
    const renderSplit = (text) => {
      const parts = text.split(/:\s|：/);
      return parts.length > 1 ? <><strong className="font-bold text-stone-900">{parts[0]}: </strong>{parts[1]}</> : text;
    };

    return (
      <ScrollContainer phase={gameState}>
        <div className="flex-1 flex flex-col items-center text-stone-900 w-full h-full max-h-full">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-widest border-b-2 border-stone-400 pb-4 w-full flex-shrink-0">{t('tutorial_title')}</h1>
          
          <div className="space-y-6 text-base md:text-lg leading-relaxed text-left font-medium w-full max-w-lg overflow-y-auto pr-2 pb-4 hide-scrollbar flex-1">
            <p className="text-center italic text-stone-700 bg-stone-800/5 p-3 rounded border border-stone-400/20">{t('tutorial_1')}</p>
            
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-red-900 border-b border-stone-400/50 pb-1">{t('tut_roles_title')}</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">🧑</span> <span>{renderSplit(t('tut_role_villager'))}</span></li>
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">🐺</span> <span>{renderSplit(t('tut_role_werewolf'))}</span></li>
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">🔮</span> <span>{renderSplit(t('tut_role_seer'))}</span></li>
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">👁️</span> <span>{renderSplit(t('tut_role_watchman'))}</span></li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-red-900 border-b border-stone-400/50 pb-1">{t('tut_phases_title')}</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">🌙</span> <span>{renderSplit(t('tut_phase_night'))}</span></li>
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">☀️</span> <span>{renderSplit(t('tut_phase_day'))}</span></li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-red-900 border-b border-stone-400/50 pb-1">{t('tut_win_title')}</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">🛡️</span> <span>{renderSplit(t('tut_win_villagers'))}</span></li>
                <li className="flex gap-3"><span className="text-2xl drop-shadow-sm flex-shrink-0">🐺</span> <span>{renderSplit(t('tut_win_werewolves'))}</span></li>
              </ul>
            </div>
          </div>
          
          <button onClick={() => setGameState('SETUP')} className="mt-6 w-full max-w-sm py-4 bg-stone-800 text-[#f4e4bc] text-xl md:text-2xl font-bold rounded shadow-lg hover:bg-stone-700 transition flex items-center justify-center gap-2 flex-shrink-0">
            {t('enter_village')} <ChevronRight />
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'SETUP') {
    return (
      <ScrollContainer phase={gameState}>
        {renderDashboard()}
        <div className="flex flex-col h-full text-stone-900" onPointerDown={handleTouchStart} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>
          <h1 className="text-4xl font-bold mb-8 text-center border-b-2 border-stone-400 pb-4">{t('setup_title')}</h1>
          
          <button 
            onClick={fetchRoster}
            disabled={isLoadingRoster}
            className="mb-6 w-full py-3 bg-indigo-900 text-[#f4e4bc] text-lg font-bold rounded shadow flex items-center justify-center gap-2 hover:bg-indigo-800 disabled:bg-stone-500 transition"
          >
            {isLoadingRoster ? <Loader2 className="animate-spin" /> : <Download />}
            {isLoadingRoster ? "Loading..." : t('load_roster')}
          </button>

          <div className="mb-4 bg-stone-800/10 p-3 rounded-xl border border-stone-400/30 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2">
             {AVATARS.map(avatar => (
               <button 
                 key={avatar} 
                 onClick={() => setSelectedAvatar(avatar)}
                 className={`text-4xl p-2 rounded-lg transition-all ${selectedAvatar === avatar ? 'bg-stone-800 scale-110 shadow-md' : 'hover:bg-stone-800/20 opacity-70'}`}
               >
                 {avatar}
               </button>
             ))}
          </div>

          <form onSubmit={addPlayer} className="flex gap-2 mb-8">
            <div className="bg-stone-800 text-white text-3xl px-4 py-2 rounded flex items-center justify-center border-2 border-stone-800">{selectedAvatar}</div>
            <input 
              type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Student Name..."
              className="flex-1 p-4 text-xl border-2 border-stone-800 rounded bg-[#fcf5e3] focus:outline-none focus:ring-2 focus:ring-stone-500 font-sans"
            />
            <button type="submit" className="px-6 bg-stone-800 text-[#f4e4bc] font-bold rounded text-2xl hover:bg-stone-700">+</button>
          </form>

          <div className="flex-1 overflow-y-auto mb-8 pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {players.map((p) => (
                <div key={p.id} className="bg-[#fcf5e3] p-3 rounded shadow-sm border border-stone-400 flex items-center gap-3">
                  <span className="text-3xl">{p.avatar}</span>
                  <span className="font-bold text-lg">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {players.length >= 4 ? (
            <button onClick={assignRoles} className="w-full py-5 bg-red-900 text-[#f4e4bc] text-2xl font-bold rounded shadow-lg hover:bg-red-800 transition">
              {t('start_game')} ({players.length} Players)
            </button>
          ) : (
            <div className="text-center text-stone-600 text-lg font-bold border-2 border-dashed border-stone-400 py-5 rounded">
              Need at least 4 players (Recommend 6+)
            </div>
          )}
        </div>
      </ScrollContainer>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  if (gameState === 'NIGHT_PASS') {
    return (
      <ScrollContainer phase={gameState}>
        {renderDashboard()}
        <div className="flex-1 flex flex-col items-center justify-center text-stone-900 text-center" onPointerDown={handleTouchStart} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>
          <Moon size={64} className="text-stone-700 mb-8 opacity-60" />
          <h2 className="text-2xl text-stone-600 mb-2 font-bold uppercase tracking-widest">{t('night_phase')}</h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-12 leading-tight">
            {t('pass_device')} <br/><br/>
            <span className="bg-stone-800 text-[#f4e4bc] px-6 py-3 rounded-lg inline-flex items-center gap-4">
              <span className="text-5xl">{currentPlayer.avatar}</span>
              {currentPlayer.name}
            </span>
          </h1>
          <button onClick={() => setGameState('NIGHT_ACTION')} className="px-12 py-5 bg-red-900 text-[#f4e4bc] text-2xl font-bold rounded shadow-lg transition hover:bg-red-800">
            {t('im_ready')}
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'NIGHT_ACTION') {
    const alivePlayers = players.filter(p => p.isAlive && p.id !== currentPlayer.id);
    let actionUI = null;
    let roleTitle = '';

    if (currentPlayer.role === 'villager') {
      roleTitle = t('role_villager');
      actionUI = (
        <div className="space-y-4 w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('decoy_prompt')}</h2>
          {[t('decoy_1'), t('decoy_2'), t('decoy_3')].map((task, i) => (
            <button key={i} onClick={() => handleTargetToggle(`done_${i}`)} className={`w-full p-4 rounded text-xl font-bold border-2 transition ${selectedTargets.includes(`done_${i}`) ? 'bg-stone-800 text-[#f4e4bc] border-stone-900' : 'bg-[#fcf5e3] border-stone-400 hover:bg-stone-300'}`}>
              {task}
            </button>
          ))}
        </div>
      );
    } else if (currentPlayer.role === 'watchman') {
      roleTitle = t('role_watchman');
      actionUI = (
        <div className="text-center w-full">
          <Eye size={64} className="mx-auto text-stone-800 mb-6" />
          <h2 className="text-2xl font-bold mb-8 leading-relaxed">{t('watchman_prompt')}</h2>
          <button onClick={() => handleTargetToggle('done')} className={`w-full p-4 rounded text-xl font-bold border-2 transition ${selectedTargets.includes('done') ? 'bg-stone-800 text-[#f4e4bc] border-stone-900' : 'bg-[#fcf5e3] border-stone-400 hover:bg-stone-300'}`}>
            I have observed
          </button>
        </div>
      );
    } else if (currentPlayer.role === 'werewolf') {
      roleTitle = t('role_werewolf');
      const aliveWolves = players.filter(p => p.role === 'werewolf' && p.isAlive);
      const otherWolves = aliveWolves.filter(w => w.id !== currentPlayer.id);
      
      let optionsToShow;
      let maxSelections;

      if (nightActions.wolfNominations.length === 0) {
        optionsToShow = alivePlayers.filter(p => p.role !== 'werewolf');
        maxSelections = Math.min(aliveWolves.length, optionsToShow.length);
      } else {
        optionsToShow = alivePlayers.filter(p => nightActions.wolfNominations.includes(p.id));
        maxSelections = Math.min(nightActions.wolfNominations.length - 1, optionsToShow.length);
        if (maxSelections < 1) maxSelections = 1;
      }
      
      const isFinal = maxSelections <= 1;
      const promptText = isFinal ? t('wolf_prompt_final') : t('wolf_prompt_dyn').replace('{n}', maxSelections);

      actionUI = (
        <div className="w-full">
          {otherWolves.length > 0 && (
            <div className="mb-6 bg-red-900/10 p-3 rounded border border-red-900/30 text-center">
              <p className="font-bold text-red-900">{t('other_wolves')}</p>
              <div className="flex justify-center gap-4 mt-2">
                {otherWolves.map(w => <span key={w.id} className="font-bold flex items-center gap-1"><span className="text-2xl">{w.avatar}</span> {w.name}</span>)}
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-6 text-center text-red-900">{promptText}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {optionsToShow.map(p => (
              <button key={p.id} onClick={() => handleTargetToggle(p.id, maxSelections)} className={`p-3 rounded flex flex-col items-center gap-2 border-2 transition ${selectedTargets.includes(p.id) ? 'bg-red-900 text-[#f4e4bc] border-red-950 shadow-inner' : 'bg-[#fcf5e3] border-stone-400'}`}>
                <span className="text-4xl">{p.avatar}</span>
                <span className="font-bold">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentPlayer.role === 'seer') {
      roleTitle = t('role_seer');
      actionUI = (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-indigo-900">{t('seer_prompt')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {alivePlayers.map(p => (
              <button key={p.id} onClick={() => handleTargetToggle(p.id, 1)} className={`p-3 rounded flex flex-col items-center gap-2 border-2 transition ${selectedTargets.includes(p.id) ? 'bg-indigo-900 text-[#f4e4bc] border-indigo-950 shadow-inner' : 'bg-[#fcf5e3] border-stone-400'}`}>
                <span className="text-4xl">{p.avatar}</span>
                <span className="font-bold">{p.name}</span>
                {selectedTargets.includes(p.id) && (
                  <span className="mt-2 text-xs uppercase bg-white text-indigo-900 px-2 py-1 rounded font-bold border border-indigo-200">
                    {p.role === 'werewolf' ? 'WEREWOLF' : 'VILLAGER'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <ScrollContainer phase={gameState}>
        <div className="flex-1 flex flex-col items-center text-stone-900 w-full h-full">
          <div className="w-full text-center mb-6 pb-4 border-b-2 border-stone-400">
            <h1 className="text-3xl font-bold uppercase tracking-widest">{roleTitle}</h1>
          </div>
          <div className="flex-1 w-full flex items-center justify-center overflow-y-auto">
            {actionUI}
          </div>
          <div className="h-20 w-full flex items-center justify-center mt-6">
            {selectedTargets.length > 0 && (
              <button onClick={nextNightTurn} className="w-full md:w-auto px-12 py-4 bg-stone-900 text-[#f4e4bc] text-xl font-bold rounded shadow-lg flex justify-center items-center gap-2 hover:bg-stone-800">
                {t('next')} <Check size={24} />
              </button>
            )}
          </div>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'MORNING_TRANSITION') {
    return (
      <ScrollContainer phase={gameState}>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-900">
          <Sun size={80} className="text-amber-500 mb-6 animate-[spin_20s_linear_infinite]" />
          <h1 className="text-5xl font-bold mb-10 tracking-widest">{t('morning_title')}</h1>
          <p className="text-2xl font-bold mb-12 max-w-sm">{t('morning_desc')}</p>
          <button onClick={() => setGameState('DAY_REVEAL')} className="px-12 py-5 bg-amber-700 text-white text-2xl font-bold rounded shadow-lg hover:bg-amber-600">
            {t('gather_btn')}
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'DAY_REVEAL') {
    return (
      <ScrollContainer phase={gameState}>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-900">
          <Sun size={80} className="text-amber-600 mb-6 animate-[spin_20s_linear_infinite]" />
          <h1 className="text-5xl font-bold mb-10 tracking-widest">{t('day_phase')}</h1>
          
          <div className="bg-[#fcf5e3] p-8 rounded shadow-inner max-w-lg w-full mb-12 border-2 border-stone-400">
            {lastKilled ? (
              <>
                <Skull size={48} className="text-red-800 mx-auto mb-4" />
                <h2 className="text-2xl text-stone-600 mb-2 font-bold">Tragedy struck the village...</h2>
                <p className="text-4xl font-bold mt-4 flex flex-col items-center gap-4">
                  <span className="text-6xl">{lastKilled.avatar}</span>
                  {lastKilled.name} was eliminated.
                </p>
              </>
            ) : (
              <>
                <Shield size={48} className="text-green-700 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">The village was safe last night!</h2>
              </>
            )}
          </div>

          <button onClick={() => setGameState('DAY_DEBATE')} className="px-12 py-5 bg-amber-700 text-white text-2xl font-bold rounded shadow-lg hover:bg-amber-600">
            Begin Debate
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'DAY_DEBATE') {
    const alivePlayers = players.filter(p => p.isAlive);
    return (
      <ScrollContainer phase={gameState}>
        {renderDashboard()}
        <div className="flex flex-col h-full text-stone-900" onPointerDown={handleTouchStart} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>
          <h1 className="text-3xl font-bold text-center mb-6 border-b-2 border-stone-400 pb-4">{t('debate_title')}</h1>

          <div className="bg-stone-800 text-[#f4e4bc] p-5 rounded shadow-lg mb-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Settings size={80} /></div>
            <h2 className="text-lg font-bold text-amber-500 mb-3 uppercase tracking-wider">Useful English Phrases</h2>
            <div className="space-y-3">
              <div className="bg-stone-900/50 p-3 rounded border border-stone-700">
                <p className="text-xl font-bold">"I suspect <span className="text-amber-400">[Name]</span> because..."</p>
              </div>
              <div className="bg-stone-900/50 p-3 rounded border border-stone-700">
                <p className="text-lg">"I agree with <span className="text-amber-400">[Name]</span>." / "I disagree."</p>
              </div>
              <div className="bg-stone-900/50 p-3 rounded border border-stone-700">
                <p className="text-lg">"I am not the Werewolf because..."</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-md font-bold text-stone-500 mb-3 uppercase tracking-widest text-center">Alive Players</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {alivePlayers.map(p => (
                <div key={p.id} className="bg-[#fcf5e3] py-2 px-1 rounded shadow-sm border border-stone-400 flex flex-col items-center justify-center">
                  <span className="text-3xl mb-1">{p.avatar}</span>
                  <span className="font-bold text-sm truncate w-full text-center">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setGameState('DAY_VOTE')} className="mt-6 w-full py-5 bg-red-900 text-[#f4e4bc] text-2xl font-bold rounded shadow-lg flex justify-center items-center gap-2 hover:bg-red-800">
            {t('vote_btn')} <ChevronRight />
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'DAY_VOTE') {
    const alivePlayers = players.filter(p => p.isAlive);
    return (
      <ScrollContainer phase={gameState}>
        <div className="flex flex-col h-full text-stone-900">
          <h1 className="text-3xl font-bold text-center mb-2">{t('vote_prompt')}</h1>
          <p className="text-center text-stone-500 mb-6 italic">Discuss as a group, then log the final decision here.</p>
          
          <div className="flex-1 overflow-y-auto mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {alivePlayers.map(p => (
                <button key={p.id} onClick={() => handleTargetToggle(p.id, 1)} className={`p-3 rounded flex flex-col items-center gap-2 border-2 transition ${selectedTargets.includes(p.id) ? 'bg-red-900 text-[#f4e4bc] border-red-950 shadow-inner' : 'bg-[#fcf5e3] border-stone-400 hover:bg-stone-300'}`}>
                  <span className="text-4xl">{p.avatar}</span>
                  <span className="font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-800 p-5 rounded border-2 border-stone-900 mb-6 text-[#f4e4bc] font-sans">
            <p className="text-center text-sm text-stone-400 uppercase tracking-widest mb-2">Read Aloud to Confirm:</p>
            <p className="text-center text-xl font-bold">
              "I vote that we eliminate <span className="text-amber-500">{selectedTargets.length > 0 ? players.find(p=>p.id === selectedTargets[0]).name : '_____'}</span> from the village."
            </p>
          </div>

          <button disabled={selectedTargets.length === 0} onClick={processDayVote} className={`w-full py-5 text-2xl font-bold rounded shadow-lg transition ${selectedTargets.length > 0 ? 'bg-red-900 text-[#f4e4bc] hover:bg-red-800' : 'bg-stone-400 text-stone-600 cursor-not-allowed'}`}>
            {t('confirm_vote')}
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'VOTE_RESULT') {
    const isWolf = lastKilled && lastKilled.role === 'werewolf';
    return (
      <ScrollContainer phase={gameState}>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-900">
          <h1 className="text-5xl font-bold mb-10 tracking-widest">{t('vote_result_title')}</h1>
          
          <div className="bg-[#fcf5e3] p-8 rounded shadow-inner max-w-lg w-full mb-12 border-2 border-stone-400 flex flex-col items-center">
            <span className="text-8xl mb-6">{lastKilled.avatar}</span>
            <p className="text-3xl font-bold mb-4">{lastKilled.name}</p>
            
            {isWolf ? (
              <div className="text-green-700 flex flex-col items-center">
                <Shield size={48} className="mb-4" />
                <p className="text-2xl font-bold">{t('vote_werewolf')}</p>
              </div>
            ) : (
              <div className="text-red-800 flex flex-col items-center">
                <Skull size={48} className="mb-4" />
                <p className="text-2xl font-bold">{t('vote_innocent')}</p>
              </div>
            )}
          </div>

          <button onClick={() => checkWinCondition(players, 'NIGHT_TRANSITION')} className="px-12 py-5 bg-stone-900 text-[#f4e4bc] text-2xl font-bold rounded shadow-lg hover:bg-stone-800">
            {t('next')}
          </button>
        </div>
      </ScrollContainer>
    );
  }

  if (gameState === 'VICTORY') {
    return (
      <ScrollContainer phase="VICTORY">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {winner === 'VILLAGERS' ? (
            <>
              <Shield size={80} className="text-green-700 mx-auto mb-6" />
              <h1 className="text-5xl font-extrabold text-green-900 mb-4 tracking-tight">VILLAGE SAVED!</h1>
              <p className="text-2xl text-stone-700 font-bold mb-8">The Werewolves have been defeated.</p>
              <div className="flex justify-center gap-4 flex-wrap mb-8">
                 {players.filter(p => p.role !== 'werewolf').map(p => (
                   <span key={p.id} className="text-4xl" title={p.name}>{p.avatar}</span>
                 ))}
              </div>
            </>
          ) : (
            <>
              <Skull size={80} className="text-red-900 mx-auto mb-6" />
              <h1 className="text-5xl font-extrabold text-red-900 mb-4 tracking-widest">ETERNAL NIGHT</h1>
              <p className="text-2xl text-stone-700 font-bold mb-8">The Werewolves have taken over the village.</p>
              <div className="flex justify-center gap-4 flex-wrap mb-10 bg-red-900/10 p-6 rounded border border-red-900/30">
                 <span className="text-red-900 font-bold w-full mb-3 uppercase tracking-widest">The Wolves were:</span>
                 {players.filter(p => p.role === 'werewolf').map(p => (
                   <div key={p.id} className="flex flex-col items-center">
                      <span className="text-5xl">{p.avatar}</span>
                      <span className="text-stone-900 font-bold mt-2">{p.name}</span>
                   </div>
                 ))}
              </div>
            </>
          )}

          <button onClick={() => { setPlayers([]); setOverrideWolfCount(0); setGameState('SETUP'); }} className="px-12 py-5 bg-stone-900 text-[#f4e4bc] font-bold rounded shadow-lg hover:bg-stone-800 transition text-xl mt-8">
            Play Again
          </button>
        </div>
      </ScrollContainer>
    );
  }

  return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
}