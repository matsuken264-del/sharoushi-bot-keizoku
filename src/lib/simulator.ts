
export interface Resource {
    title: string;
    url: string;
    snippet: string;
    source: "Law" | "Circular" | "MHLW" | "Leaflet" | "Q&A";
}

export interface ChatResponse {
    text: string;
    references: Resource[];
}

// Simplified mock delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Expanded Mock Database
const KNOWLEDGE_BASE: Resource[] = [
    // Laws
    {
        title: "雇用保険法 第6条（被保険者）",
        url: "https://elaws.e-gov.go.jp/document?lawid=349AC0000000116#Mp-At_6",
        snippet: "次の各号のいずれかに該当する者は、前条の規定にかかわらず、被保険者とならない。... 一 週間の所定労働時間が二十時間未満である者",
        source: "Law",
    },
    {
        title: "雇用保険法 第13条（基本手当の受給資格）",
        url: "https://elaws.e-gov.go.jp/document?lawid=349AC0000000116#Mp-At_13",
        snippet: "基本手当は、被保険者が失業した場合において、離職の日以前二年間に、被保険者期間が通算して十二箇月以上であったときに支給する。",
        source: "Law",
    },
    {
        title: "健康保険法 第3条（定義）",
        url: "https://elaws.e-gov.go.jp/document?lawid=211AC0000000070#Mp-At_3",
        snippet: "この法律において「被保険者」とは、適用事業所に使用される者...をいう。",
        source: "Law",
    },
    {
        title: "労働基準法 第15条（労働条件の明示）",
        url: "https://elaws.e-gov.go.jp/document?lawid=322AC0000000049#Mp-At_15",
        snippet: "使用者は、労働契約の締結に際し、労働者に対して賃金、労働時間その他の労働条件を明示しなければならない。",
        source: "Law",
    },

    // Circulars (通達)
    {
        title: "雇保発0805第1号「短時間労働者の雇用保険適用について」",
        url: "https://www.mhlw.go.jp/web/t_doc?dataId=00tc4882&dataType=1&pageNo=1",
        snippet: "週所定労働時間が20時間以上であることの判定にあたっては、雇用契約書等により確認すること。",
        source: "Circular",
    },
    {
        title: "基発0401第11号「年次有給休暇の時季指定義務について」",
        url: "https://www.mhlw.go.jp/hourei/doc/tsuchi/T190416K0010.pdf",
        snippet: "年10日以上の年次有給休暇が付与される労働者に対し、年5日については時季を指定して取得させることが使用者の義務となる。",
        source: "Circular",
    },

    // MHLW / Leaflets / Q&A
    {
        title: "雇用保険事務手続きの手引き",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/koyouhoken/index.html",
        snippet: "資格取得届は、被保険者となった日の翌月10日までに、管轄のハローワークへ提出する必要があります。",
        source: "MHLW",
    },
    {
        title: "Q&A 雇用保険の適用拡大について",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000148322.html",
        snippet: "Q. パートタイマーも雇用保険に入れますか？ A. 週20時間以上かつ31日以上の雇用見込みがあれば、原則として加入が必要です。",
        source: "Q&A",
    },
    {
        title: "業務取扱要領（雇用保険関係）",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/koyouhoken/data/toriatsukai_youryou.html",
        snippet: "第20151コン　被保険者資格の取得及び喪失の手続等...",
        source: "MHLW",
    },
];

export async function simulateResponse(query: string): Promise<ChatResponse> {
    // Simulate network delay related to search complexity
    const delayTime = 1500 + Math.random() * 1000;
    await delay(delayTime);

    const lowerQuery = query.toLowerCase();

    // Advanced keyword matching
    const keywords = query.match(/[^\s、。]+/g) || [];

    const references = KNOWLEDGE_BASE.filter((res) => {
        // Check if resource matches at least one keyword strongly or multiple weakly
        let score = 0;
        if (referencesMatches(res, ["雇用保険", "失業"], lowerQuery)) score += 3;
        if (referencesMatches(res, ["健康保険", "社会保険"], lowerQuery)) score += 3;
        if (referencesMatches(res, ["労働基準", "解雇", "有給"], lowerQuery)) score += 3;

        // Specific content matching
        if (res.title.includes(query) || res.snippet.includes(query)) score += 5;

        // Keyword overlap
        keywords.forEach(k => {
            if (res.title.includes(k)) score += 2;
            if (res.snippet.includes(k)) score += 1;
        });

        return score > 2; // threshold
    }).sort((a, b) => {
        // Stable sort for now
        return 0;
    }).slice(0, 4);

    let text = "";

    if (references.length > 0) {
        text = `社会保険労務士AIシミュレーターです。ご質問の件について、最新の法令および厚生労働省の資料に基づき回答いたします。\n\n結論から申し上げますと、以下の通りです。\n\n詳細な根拠としては、`;

        // Build context-aware synthesis
        references.forEach(ref => {
            text += `\n**【${ref.source === 'Law' ? '法令' : ref.source === 'Circular' ? '通達' : ref.source === 'Q&A' ? 'Q&A' : '資料'}】${ref.title}** では、\n> ${ref.snippet}\nとされています。\n`;
        });

        text += `\nしたがって、実務上はこれらの規定に則り手続きを行う必要があります。`;

        if (query.includes("手続き")) {
            text += `\n\nなお、具体的な届出用紙（様式）については、ハローワークインターネットサービス等からダウンロード可能です。`;
        }

    } else {
        // Fallback for unmatched queries (Generalist Professional Persona)
        text = `ご質問ありがとうございます。\n「${query}」については、個別の事情により判断が分かれる可能性がございますが、一般的な労働法令の観点からは以下のように考えられます。\n\n現時点の検索範囲では直接合致する法令条文がヒットしませんでしたが、原則として労働関係諸法令（労働基準法など）が適用されます。\n\nより正確な回答のためには、詳細な雇用形態や契約内容（週の所定労働時間など）をご教示いただけますと幸いです。`;
    }

    return {
        text,
        references,
    };
}

function referencesMatches(res: Resource, keywords: string[], query: string): boolean {
    const isTopic = keywords.some(k => query.includes(k));
    if (!isTopic) return false;

    // If query is about topic, does resource relate to topic?
    return keywords.some(k => res.title.includes(k) || res.snippet.includes(k));
}
