import { useState, useRef, useEffect } from 'react';
import { Bot, User, Globe2, Loader2, Sparkles, BookOpen, Send, Undo2, Home, Plane, Building, Utensils } from 'lucide-react';
import { GameResponse, Scenario } from './types';
import { MOCK_SCENARIOS, evaluateUserAnswer } from './mockData';

type UIChatItem = 
  | { type: 'user'; content: string; id: string }
  | { type: 'model_response'; data: GameResponse; id: string };

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const UserBubble = ({ content }: { content: string }) => (
  <div className="flex w-full justify-end">
    <div className="flex max-w-[85%] sm:max-w-[75%] flex-row-reverse items-start gap-3">
      <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
        <User className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="p-4 rounded-2xl shadow-sm bg-indigo-600 text-white rounded-tr-none">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  </div>
);

const ModelBubble = ({ data }: { data: GameResponse }) => (
  <div className="flex flex-col w-full gap-6 mb-4">
    {data.evaluation && (
      <div className="flex w-full justify-start">
        <div className="flex max-w-[85%] sm:max-w-[90%] flex-row items-start gap-3">
          <div className="flex flex-col items-center gap-1 shrink-0 w-14">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight text-center leading-tight break-words">AI Eval</span>
          </div>
          <div className="p-4 rounded-2xl shadow-sm bg-white border border-slate-200 text-slate-700 rounded-tl-none w-full">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Evaluation
            </h3>
            
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NPC Reaction</p>
              <p className="text-indigo-700 font-medium">"{data.evaluation.npc_reaction}"</p>
            </div>
            
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-full text-sm">
                Score: {data.evaluation.score} / 10
              </span>
            </div>
            <p className="mb-4 text-sm leading-relaxed">{data.evaluation.explanation}</p>
            
            <h4 className="font-semibold text-slate-800 mb-2 text-sm">Alternative Phrases:</h4>
            <ul className="list-disc pl-5 mb-5 text-sm space-y-2">
              {data.evaluation.alternative_phrases.map((alt, i) => (
                <li key={i}>
                  <strong>{alt.phrase}</strong> <br/>
                  <span className="text-slate-500">{alt.nuance}</span>
                </li>
              ))}
            </ul>
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
              <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <Globe2 className="w-4 h-4" /> Cultural Note
              </h4>
              <p className="text-amber-900 leading-relaxed">{data.evaluation.cultural_note}</p>
            </div>
          </div>
        </div>
      </div>
    )}
    
    <div className="flex w-full justify-start">
      <div className="flex max-w-[85%] sm:max-w-[90%] flex-row items-start gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0 w-14">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight text-center leading-tight break-words">
            {data.next_scenario.npc_role || "NPC"}
          </span>
        </div>
        <div className="p-4 rounded-2xl shadow-sm bg-emerald-50 border border-emerald-200 text-slate-700 rounded-tl-none w-full relative">
          <p className="mb-3 text-slate-800 font-medium italic text-lg">"{data.next_scenario.npc_dialogue}"</p>
          <div className="bg-white/70 p-3 rounded-lg text-sm text-slate-700 leading-relaxed border border-emerald-100/50">
            {data.next_scenario.description}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [chatItems, setChatItems] = useState<UIChatItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [availableWords, setAvailableWords] = useState<{id: number, word: string}[]>([]);
  const [selectedWords, setSelectedWords] = useState<{id: number, word: string}[]>([]);
  const [language, setLanguage] = useState<'en' | 'ja'>('ja');
  const [gameMode, setGameMode] = useState<'scramble' | 'free'>('scramble');
  const [category, setCategory] = useState<string>('airport');
  const [freeInput, setFreeInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatItems, isLoading, selectedWords]);

  const setupScenario = (scenario: Scenario) => {
    setCurrentScenario(scenario);
    const words = scenario.target_sentence.trim().split(/\s+/).map((word, i) => ({ id: i, word }));
    setAvailableWords(shuffleArray(words));
    setSelectedWords([]);
    setFreeInput('');
  };

  const handleReturnToTitle = () => {
    setIsStarted(false);
    setChatItems([]);
    setCurrentScenario(null);
    setCurrentScenarioIndex(0);
    setFreeInput('');
  };

  const startGame = async () => {
    setIsStarted(true);
    setIsLoading(true);
    
    setTimeout(() => {
      const scenarios = MOCK_SCENARIOS[category] || MOCK_SCENARIOS['airport'];
      const firstScenario = scenarios[0].scenario;
      
      const gameData: GameResponse = {
        evaluation: null,
        next_scenario: firstScenario
      };
      
      setCurrentScenarioIndex(0);
      setChatItems([{ type: 'model_response', data: gameData, id: Date.now().toString() }]);
      
      setupScenario(firstScenario);
      setIsLoading(false);
    }, 600);
  };

  const handleWordSelect = (wordObj: {id: number, word: string}) => {
    setAvailableWords(availableWords.filter(w => w.id !== wordObj.id));
    setSelectedWords([...selectedWords, wordObj]);
  };

  const handleWordDeselect = (wordObj: {id: number, word: string}) => {
    setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    setAvailableWords([...availableWords, wordObj]);
  };

  const handleReset = () => {
    setAvailableWords([...availableWords, ...selectedWords]);
    setSelectedWords([]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;

    let constructedSentence = '';
    if (gameMode === 'scramble') {
      if (selectedWords.length === 0) return;
      constructedSentence = selectedWords.map(w => w.word).join(' ');
    } else {
      if (!freeInput.trim()) return;
      constructedSentence = freeInput.trim();
    }
    
    setChatItems(prev => [...prev, { type: 'user', content: constructedSentence, id: Date.now().toString() }]);
    
    const scenarios = MOCK_SCENARIOS[category] || MOCK_SCENARIOS['airport'];
    const currentMockData = scenarios[currentScenarioIndex];
    
    setCurrentScenario(null);
    setIsLoading(true);

    setTimeout(() => {
      let evaluation = null;
      if (currentMockData) {
        evaluation = evaluateUserAnswer(constructedSentence, currentMockData);
      }
      
      const nextIndex = currentScenarioIndex + 1;
      let nextScenarioData;
      
      if (nextIndex < scenarios.length) {
        nextScenarioData = scenarios[nextIndex].scenario;
        setCurrentScenarioIndex(nextIndex);
      } else {
        nextScenarioData = {
          npc_role: "System",
          npc_dialogue: "Congratulations! You have completed all scenarios.",
          description: "このカテゴリーのシナリオをすべてクリアしました！タイトルに戻って別のカテゴリーに挑戦してみてください。",
          target_sentence: "I want to try again."
        };
      }

      const gameData: GameResponse = {
        evaluation: evaluation,
        next_scenario: nextScenarioData
      };
      
      setChatItems(prev => [...prev, { type: 'model_response', data: gameData, id: Date.now().toString() }]);
      setupScenario(nextScenarioData);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-indigo-600 text-white shadow-md p-4 flex items-center justify-between shrink-0 relative">
        {isStarted && (
          <button 
            onClick={handleReturnToTitle}
            className="absolute left-4 p-2 bg-indigo-500 hover:bg-indigo-700 rounded-full transition-colors flex items-center justify-center text-sm font-medium gap-1"
            title="Return to Title"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Title</span>
          </button>
        )}
        <div className="flex items-center justify-center w-full">
          <Globe2 className="w-6 h-6 mr-3" />
          <h1 className="text-xl font-bold tracking-wider">Phrase Master</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col gap-6">
        {!isStarted ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">English Travel Simulator</h2>
            <p className="text-slate-600 mb-6 max-w-lg leading-relaxed">
              Handle common travel situations in English! Construct the perfect sentence by scrambling words. 
              The AI will grade you and teach you valuable cultural tips.
            </p>

            <div className="flex flex-col gap-6 mb-8 w-full max-w-md">
              <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Category / シーン</span>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    onClick={() => setCategory('airport')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      category === 'airport' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    <Plane className="w-6 h-6" />
                    <span className="text-sm font-medium">{language === 'ja' ? '空港' : 'Airport'}</span>
                  </button>
                  <button
                    onClick={() => setCategory('hotel')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      category === 'hotel' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    <Building className="w-6 h-6" />
                    <span className="text-sm font-medium">{language === 'ja' ? 'ホテル' : 'Hotel'}</span>
                  </button>
                  <button
                    onClick={() => setCategory('restaurant')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      category === 'restaurant' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    <Utensils className="w-6 h-6" />
                    <span className="text-sm font-medium">{language === 'ja' ? 'レストラン' : 'Restaurant'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 w-full">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Language / 言語</span>
                  <div className="flex bg-slate-100 p-1 rounded-full w-full">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('ja')}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        language === 'ja' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      日本語
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 w-full">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Mode / モード</span>
                  <div className="flex bg-slate-100 p-1 rounded-full w-full">
                    <button
                      onClick={() => setGameMode('scramble')}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        gameMode === 'scramble' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Scramble
                    </button>
                    <button
                      onClick={() => setGameMode('free')}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        gameMode === 'free' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Free Text
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              {language === 'ja' ? 'ゲームを始める' : 'Start Learning'}
            </button>
          </div>
        ) : (
          <>
            {chatItems.map((item) => (
              <div key={item.id} className="w-full">
                {item.type === 'user' ? (
                  <UserBubble content={item.content} />
                ) : (
                  <ModelBubble data={item.data} />
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[75%]">
                   <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-sm flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="text-sm">Evaluating...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {isStarted && (
        <footer className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="max-w-4xl mx-auto">
            {currentScenario ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Construct your answer:</div>
                  
                  {gameMode === 'scramble' ? (
                    <>
                      <div className="min-h-[60px] p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-wrap gap-2 items-center">
                        {selectedWords.length === 0 ? (
                          <span className="text-slate-400 italic text-sm">Tap words below to build a sentence...</span>
                        ) : (
                          selectedWords.map((w) => (
                            <button
                              key={w.id}
                              onClick={() => handleWordDeselect(w)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors active:scale-95 text-sm font-medium animate-in zoom-in duration-200"
                            >
                              {w.word}
                            </button>
                          ))
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center py-2">
                        {availableWords.map((w) => (
                          <button
                            key={w.id}
                            onClick={() => handleWordSelect(w)}
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors active:scale-95 text-sm font-medium animate-in zoom-in duration-200"
                          >
                            {w.word}
                          </button>
                        ))}
                        {availableWords.length === 0 && selectedWords.length > 0 && (
                          <span className="text-sm text-emerald-600 font-medium self-center animate-in fade-in">
                            Ready to send!
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={freeInput}
                        onChange={(e) => setFreeInput(e.target.value)}
                        placeholder="Type your answer in English..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors disabled:opacity-50"
                      />
                    </form>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-3">
                  {gameMode === 'scramble' ? (
                    <button
                      onClick={handleReset}
                      disabled={selectedWords.length === 0}
                      className="flex items-center gap-1 px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      <Undo2 className="w-4 h-4" /> Reset
                    </button>
                  ) : (
                    <div></div> // Placeholder for spacing
                  )}
                  <button
                    onClick={() => handleSubmit()}
                    disabled={(gameMode === 'scramble' ? selectedWords.length === 0 : !freeInput.trim()) || isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-full shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-colors active:scale-95"
                  >
                    Send <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 text-slate-500 italic">
                {isLoading ? "Please wait..." : "Loading next scenario..."}
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
