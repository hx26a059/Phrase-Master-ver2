import { GameResponse, Scenario, Evaluation } from './types';

export interface MockScenarioData {
  scenario: Scenario;
  evaluation: Evaluation;
}

export const MOCK_SCENARIOS: Record<string, MockScenarioData[]> = {
  airport: [
    {
      scenario: {
        npc_role: "Immigration Officer",
        npc_dialogue: "May I see your passport and boarding pass, please?",
        description: "入国審査官にパスポートと搭乗券を見せるように言われました。「はい、どうぞ」と渡してください。",
        target_sentence: "Here you go.",
      },
      evaluation: {
        npc_reaction: "Thank you. What is the purpose of your visit?",
        score: 10,
        explanation: "「Here you go.」は物を渡すときの定番フレーズで、とても自然です。",
        alternative_phrases: [
          { phrase: "Here it is.", nuance: "単数形の場合に使える表現です。" },
          { phrase: "Sure.", nuance: "カジュアルな場面で使えます。" }
        ],
        cultural_note: "入国審査では堂々と、はっきりとした声で答えることが大切です。"
      }
    },
    {
      scenario: {
        npc_role: "Immigration Officer",
        npc_dialogue: "What is the purpose of your visit?",
        description: "訪問の目的を聞かれました。「観光です」と答えてください。",
        target_sentence: "I am here for sightseeing.",
      },
      evaluation: {
        npc_reaction: "I see. Enjoy your trip.",
        score: 10,
        explanation: "観光目的であることを伝える、最も標準的で間違いのない表現です。",
        alternative_phrases: [
          { phrase: "For sightseeing.", nuance: "少しカジュアルですが、通じます。" },
          { phrase: "On vacation.", nuance: "休暇で来ていることを強調する表現です。" }
        ],
        cultural_note: "観光目的（sightseeing / vacation）とビジネス目的（business）は明確に区別されます。"
      }
    },
    {
      scenario: {
        npc_role: "Customs Officer",
        npc_dialogue: "Do you have anything to declare?",
        description: "税関で申告するものがあるか聞かれました。「申告するものはありません」と答えてください。",
        target_sentence: "I have nothing to declare.",
      },
      evaluation: {
        npc_reaction: "Alright, you are good to go. Have a nice day.",
        score: 10,
        explanation: "税関での定番フレーズです。明確に伝えることが重要です。",
        alternative_phrases: [
          { phrase: "Nothing.", nuance: "簡潔な答え方です。" },
          { phrase: "No, I don't.", nuance: "質問に対する直接的な否定の答え方です。" }
        ],
        cultural_note: "食品や多額の現金を持っている場合は、正直に申告する必要があります。"
      }
    }
  ],
  hotel: [
    {
      scenario: {
        npc_role: "Receptionist",
        npc_dialogue: "Welcome to the Grand Hotel. How can I help you?",
        description: "ホテルの受付です。「チェックインをお願いします」と伝えてください。",
        target_sentence: "I would like to check in, please.",
      },
      evaluation: {
        npc_reaction: "Certainly. May I have your name?",
        score: 10,
        explanation: "丁寧で自然なチェックインの申し出です。",
        alternative_phrases: [
          { phrase: "Check in, please.", nuance: "シンプルですが、問題なく伝わります。" }
        ],
        cultural_note: "海外のホテルでは、最初に挨拶（Helloなど）を交わすのがマナーです。"
      }
    },
    {
      scenario: {
        npc_role: "Receptionist",
        npc_dialogue: "Certainly. May I have your name, please?",
        description: "名前を聞かれました。「私の名前は田中です」と答えてください。（※田中を自分の名前に置き換えても構いません）",
        target_sentence: "My name is Tanaka.",
      },
      evaluation: {
        npc_reaction: "Thank you, Mr. Tanaka. I have your reservation here.",
        score: 10,
        explanation: "シンプルでわかりやすい自己紹介です。",
        alternative_phrases: [
          { phrase: "I'm Tanaka.", nuance: "よりカジュアルな言い方です。" },
          { phrase: "The reservation is under Tanaka.", nuance: "「田中という名前で予約しています」というスマートな表現です。" }
        ],
        cultural_note: "予約名を伝えるときは、苗字（Family name/Last name）を伝えるのが一般的です。"
      }
    }
  ],
  restaurant: [
    {
      scenario: {
        npc_role: "Waiter",
        npc_dialogue: "Are you ready to order?",
        description: "注文を聞かれました。「もう少し時間をいただけますか？」と伝えてください。",
        target_sentence: "Could we have a little more time, please?",
      },
      evaluation: {
        npc_reaction: "Of course. Take your time. I'll be back in a moment.",
        score: 10,
        explanation: "丁寧で、ウェルターに対して配慮のある表現です。",
        alternative_phrases: [
          { phrase: "Not yet, please.", nuance: "少しぶっきらぼうに聞こえる可能性があります。" },
          { phrase: "We need a few more minutes.", nuance: "より具体的に時間が必要であることを伝える表現です。" }
        ],
        cultural_note: "注文が決まっていないときは、メニューを開いたままにしておくと「まだ決まっていない」というサインになります。"
      }
    },
    {
      scenario: {
        npc_role: "Waiter",
        npc_dialogue: "Okay, what would you like to have?",
        description: "注文が決まりました。「このステーキをお願いします」とメニューを指さしながら伝えてください。",
        target_sentence: "I will have this steak, please.",
      },
      evaluation: {
        npc_reaction: "Excellent choice. How would you like your steak cooked?",
        score: 10,
        explanation: "「I'll have ~」は注文時の最も一般的な表現です。",
        alternative_phrases: [
          { phrase: "I'd like this steak, please.", nuance: "同様に丁寧な表現です。" },
          { phrase: "This one, please.", nuance: "メニューを指さしながら言う簡潔な表現です。" }
        ],
        cultural_note: "海外では「This one, please」とメニューを指差すだけで通じることが多いです。"
      }
    }
  ]
};

// 簡易的な評価ロジック
export function evaluateUserAnswer(
  userAnswer: string,
  scenarioData: MockScenarioData
): Evaluation {
  const target = scenarioData.scenario.target_sentence.toLowerCase().replace(/[.,!?]/g, '').trim();
  const user = userAnswer.toLowerCase().replace(/[.,!?]/g, '').trim();

  let score = 0;
  let explanation = '';

  if (target === user) {
    score = 10;
    explanation = scenarioData.evaluation.explanation;
  } else if (user.length > 0 && target.includes(user)) {
    score = 7;
    explanation = `惜しいです！正解は "${scenarioData.scenario.target_sentence}" です。あなたの回答も意味は伝わるかもしれません。`;
  } else {
    score = 3;
    explanation = `正解は "${scenarioData.scenario.target_sentence}" でした。違う表現ですが、会話が続くこともあります。`;
  }

  return {
    ...scenarioData.evaluation,
    score,
    explanation,
  };
}
