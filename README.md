>课程内容： [学习资源](https://www.bilibili.com/video/BV1wFLQzuEVc/?spm_id_from=333.1387.homepage.video_card.click&vd_source=5ec42ab66e6ff2b6bbae68da17eb304d)
>前端部分：Nextjs，Wagmi，TailwindCSS，Rainbow Kit
>后端部分：AWS lamdba function, AWS DynamoDB, IAM账户设置，API key设置
>区块链部分：Chainlink Functions 合约，ERC721合约，API调用脚本

# 1. 创建项目、安装依赖、运行项目
```bash
pnpm create wagmi
cd web3-blackjack
pnpm install
pnpm run dev
```

## 目录结构介绍
```
web3-blackjack/
├── .next/                # Next.js 构建缓存
├── node_modules/         # 项目依赖库
├── src/
│   └── app/              # Next.js 13+ App Router 核心
│       ├── globals.css   # 全局CSS样式
│       ├── layout.tsx    # 全局布局组件
│       ├── page.tsx      # 首页组件
│       ├── providers.tsx # Web3 提供者封装
│       └── wagmi.ts      # wagmi 客户端配置
├── .env.local            # 本地环境变量
├── .gitignore            # Git忽略规则
├── .npmrc                # npm/pnpm配置
├── next.config.js        # Next.js高级配置
├── next-env.d.ts         # Next.js类型声明
├── package.json          # 项目依赖配置
├── pnpm-lock.yaml        # pnpm锁文件
├── README.md             # 项目文档
└── tsconfig.json         # TypeScript配置
```
> 1. ​`src/app/`- Next.js App Router 核心: `layout.tsx`、`providers.tsx`、`wagmi.ts`
> 2. ​Next.js 配置文件: `next.config.js`
> 3. 环境配置：`.env.local`（NEXT_PUBLIC_ 前缀 都能访问，不带此前缀只能后端访问）

![[nextjs流程.png]]

# 2. 引入TailwindCSS
> 参考官方文档：[https://tailwindcss.com/docs/installation/using-postcss](https://tailwindcss.com/docs/installation/using-postcss)

```bash
# 安装依赖
pnpm add tailwindcss @tailwindcss/postcss postcss
```

创建配置文件 `postcss.config.mjs`

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {}, 
  }
}
```

导入css，修改 src/app/globals.css
```css
@import "tailwindcss";
```


# 3. 编写前后端代码
## 1. 重写 `page.tsx`
```tsx
"use client"  
import {useState, useEffect} from 'react';  
import {Card} from "@/app/api/route";  
  
export default function Page() {  
    const [message, setMessage] = useState<string>();  
    const [dealerHand, setDealerHand] = useState<Card[]>([]);  
    const [playerHand, setPlayerHand] = useState<Card[]>([]);  
    const [score, setScore] = useState<number>(0);  
    useEffect(() => {  
        const initialGame = async () => {  
            const response = await fetch("/api", {method: "GET"});  
            const data = await response.json();  
            setDealerHand(data.dealerHand);  
            setPlayerHand(data.playerHand);  
            setMessage(data.message);  
            setScore(data.score);  
        }  
        initialGame();  
    }, []);  
  
    async function handleHit() {  
        const response = await fetch("/api", {method: "POST", body: JSON.stringify({ action: "hit" })});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
    async function handleStand() {  
        const response = await fetch("/api", {method: "POST", body: JSON.stringify({ action: "stand" })});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
    async function handleReset() {  
        const response = await fetch("/api", {method: "GET"});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
  
    return (  
        <div className="flex flex-col gap-2 items-center justify-center h-screen">  
            <h1 className="text-3xl"> Welcome to Web3 game Balck jack </h1>  
            <h2 className={`text-2xl ${message?.includes("wins") ? "bg-green-300" : "bg-amber-300"}`}> Score: {score} {message} </h2>  
            <div className="mt-4">  
                <h2>Dealer's hand</h2>  
                <div className="flex flex-row gap-2">  
                    {  
                        dealerHand.map((card, index) => (  
                                <div key={index}  
                                     className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">  
                                    <p className="self-start p-2 text-lg">{card.rank}</p>  
                                    <p className="self-center p-2 text-3xl">{card.suit}</p>  
                                    <p className="self-end p-2 text-lg">{card.rank}</p>  
                                </div>                            )  
                        )  
                    }  
                </div>  
            </div>            <div className="mt-2">  
                <h2>Player's hand</h2>  
                <div className="flex flex-row gap-2">  
                    {  
                        playerHand.map((card, index) => (  
                                <div key={index}  
                                     className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">  
                                    <p className="self-start p-2 text-lg">{card.rank}</p>  
                                    <p className="self-center p-2 text-3xl">{card.suit}</p>  
                                    <p className="self-end p-2 text-lg">{card.rank}</p>  
                                </div>                            )  
                        )  
                    }  
                </div>  
            </div>            <div className="flex flex-row gap-2 mt-4">  
                {  
                    message === "" ?  
                        <>  
                            <button onClick={handleHit} className="bg-blue-300 rounded-md p-2">Hit</button>  
                            <button onClick={handleStand} className="bg-blue-300 rounded-md p-2">Stand</button>  
                        </> :  
                        <button onClick={handleReset} className="bg-blue-300 rounded-md p-2">Reset</button>  
                }  
  
            </div>  
        </div>    )  
}
```

## 2. 编写后端代码：`src/app/api/route.ts`
```ts
// 游戏开始时，分别为两端获取随机卡  
export interface Card {  
    rank: string,  
    suit: string  
}  
  
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];  
const suits = ["♠️", "♣️", "♥️", "♦️"];  
const initialDeck: { rank: string, suit: string }[] = ranks.map(rank => suits.map(suit => ({  
    "rank": rank,  
    "suit": suit  
}))).flat();  
  
  
const gameState: {  
    dealerHand: Card[],  
    playerHand: Card[],  
    deck: Card[],  
    message: string,  
    score: number,  
} = {  
    dealerHand: [],  
    playerHand: [],  
    deck: initialDeck,  
    message: '',  
    score: 0,  
};  
  
function getRandomCards(deck: Card[], count: number): [Card[], Card[]] {  
    const randomIndexCards = new Set<number>();  
    while (randomIndexCards.size < count) {  
        randomIndexCards.add(Math.floor(Math.random() * deck.length));  
    }  
    const randomCards = deck.filter((_, index) => randomIndexCards.has(index));  
    const remainingCards = deck.filter((_, index) => !randomIndexCards.has(index));  
    return [randomCards, remainingCards];  
}  
  
export function GET() {  
    gameState.dealerHand = [];  
    gameState.playerHand = [];  
    gameState.deck = initialDeck;  
    gameState.message = "";  
  
    const [playerCards, remainingCards] = getRandomCards(gameState.deck, 2);  
    const [dealerCards, newCards] = getRandomCards(remainingCards, 2);  
    gameState.playerHand = playerCards;  
    gameState.dealerHand = dealerCards;  
    gameState.deck = newCards;  
    gameState.message = ""  
  
    return new Response(JSON.stringify({  
        dealerHand: [gameState.dealerHand[0], {"rank": "?", "suit": "?"} as Card],  
        playerHand: gameState.playerHand,  
        message: gameState.message,  
        score: gameState.score,  
    }), {  
        status: 200,  
    });  
}  
  
// 当点击 hit 时，抽取一张随机卡，加入到 player 卡组中  
export async function POST(request: Request) {  
    const {action} = await request.json();  
  
    // 计算卡牌的分值  
    // 如果 分数 =21 player就赢了  
    // 如果 分数 > 21 player就输了  
    // 如果 分数是 < 21 可以继续 hit 或 stand    if (action === "hit") {  
        const [cards, newCards] = getRandomCards(gameState.deck, 1);  
        gameState.playerHand.push(...cards);  
        gameState.deck = newCards;  
        let value = calculateHandValue(gameState.playerHand);  
        if (value === 21) {  
            gameState.message = "Black Jack! Player wins!";  
            gameState.score += 100;  
        } else if (value > 21) {  
            gameState.message = "Bust! Player loses!";  
            gameState.score -= 100;  
        }  
    }  
    // 当点击 stand 时，抽取一张随机卡，加入到 hand 卡组中  
    // 直到某个卡组 >= 17 时  
    // 计算卡牌的分值  
    // 如果 分数 =21 hand就赢了  
    // 如果 分数 > 21 hand就输了  
    // 如果 分数是 < 21 可以继续 hit 或 stand    else if (action === "stand") {  
        while (calculateHandValue(gameState.dealerHand) < 17) {  
            const [cards, newCards] = getRandomCards(gameState.deck, 1);  
            gameState.dealerHand.push(...cards);  
            gameState.deck = newCards;  
        }  
        const dealerValue = calculateHandValue(gameState.dealerHand);  
        const playerValue = calculateHandValue(gameState.playerHand);  
        // 平局
        if (dealerValue === dealerValue) {  
            gameState.message = "Draw!";  
        } else if (dealerValue > 21) {  
            gameState.message = "Dealer bust! Player wins!";  
            gameState.score += 100;  
        } else if (dealerValue === 21) {  
            gameState.message = "Dealer black jack! Player loses!";  
            gameState.score -= 100;  
        } else {  
	        // 比较两者分值  
            if (playerValue > dealerValue) {  
                gameState.message = "Player wins!";  
                gameState.score += 100;  
            } else if (playerValue < dealerValue) {  
                gameState.message = "Player loses!";  
                gameState.score -= 100;  
            }  
        }  
    }  
    else {  
        return new Response(JSON.stringify({message: "Invalid action"}), {status: 400});  
    }  
  
    console.log(`message=${gameState.message},   
    dealerHand=${JSON.stringify(gameState.dealerHand)}, dealerScore=${calculateHandValue(gameState.dealerHand)},  
    playerHand=${JSON.stringify(gameState.playerHand)}, playerScore=${calculateHandValue(gameState.playerHand)}  
    `);  
    return new Response(JSON.stringify({  
        dealerHand: gameState.message === "" ? [gameState.dealerHand[0], {rank: "?", suit: "?"} as Card] : gameState.dealerHand,  
        playerHand: gameState.playerHand,  
        message: gameState.message,  
        score: gameState.score,  
    }), {  
        status: 200,  
    });  
}  
  
  
function calculateHandValue(playerHand: Card[]) {  
    let value = 0;  
    let aceCount = 0;  
    for (const card of playerHand) {  
        if (card.rank === "A") {  
            value += 11;  
            aceCount++;  
        } else if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {  
            value += 10;  
        } else {  
            value += parseInt(card.rank);  
        }  
    }  
    while (aceCount > 0 && value > 21) {  
        value -= 10;  
        aceCount--;  
    }  
    return value;  
}
```

## 3. 测试代码逻辑
```bash
pnpm run dev
```

# 4. 加入 AWS DynamoDB，持久化玩家分数
## 1. 注册aws账户、创建表结构、分区
>  [DynamoDB](https://ap-southeast-2.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-2#service)  -->   [Tables](https://ap-southeast-2.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-2#tables)   --> Create table
## 2. 创建账户，将数据库权限分配给账户
>  [IAM](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/home)   ->  [Users](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/users)  ->  Create user --> Create user group  --> 分配 AmazonDynamoDBFullAccess 权限  --> 完成用户创建
## 3. 创建访问的key
>  IAM --> Users -->  DynamoDB_user  -->  Create access key


# 5. 改造代码支持数据库的读写操作

## 1. 将 access key 写入配置文件，编写 `.env.local`
```conf
...
AWS_USER_ACCESS_KEY=...
AWS_USER_SECRET_ACCESS_KEY=...
```

## 2. 使用ai生成读写 dynamoDB 的ts代码
推荐使用 [grok](https://grok.com/c/efb00396-dbc5-4184-967f-c537ef9ffa6e) 资源相对较新
> 参考提示词：
> 我在 aws 中有一个dynamoDb 的 table， table的名字是 blackJack，partition key 是 player，我需要在table中存储另一个整数类型的值score，请帮我写一段ts的读写数据库的代码

> ⚠️注意：`region` 和 `credentials` 参数的内容根据实际情况进行调整

```ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";  
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";  
  
// 初始化DynamoDB客户端，包含访问密钥配置  
const client = new DynamoDBClient({  
    region: "us-east-1", // 根据你的AWS区域调整  
    credentials: {  
        accessKeyId: process.env.AWS_USER_ACCESS_KEY || "",  
        secretAccessKey: process.env.AWS_USER_SECRET_ACCESS_KEY || "",  
    },  
});  
const docClient = DynamoDBDocumentClient.from(client);  
  
// 表名  
const TABLE_NAME = "blackJack";  
  
// 接口定义  
interface PlayerScore {  
    player: string;  
    score: number;  
}  
  
// 添加或更新玩家分数  
async function putPlayerScore(player: string, score: number): Promise<void> {  
    const params = {  
        TableName: TABLE_NAME,  
        Item: {  
            player,  
            score,  
        },  
    };  
  
    try {  
        await docClient.send(new PutCommand(params));  
        console.log(`Successfully saved score for player: ${player}`);  
    } catch (error) {  
        console.error(`Error saving score for player: ${player}`, error);  
        throw error;  
    }  
}  
  
// 获取玩家分数  
async function getPlayerScore(player: string): Promise<PlayerScore | null> {  
    const params = {  
        TableName: TABLE_NAME,  
        Key: {  
            player,  
        },  
    };  
  
    try {  
        const { Item } = await docClient.send(new GetCommand(params));  
        return Item ? (Item as PlayerScore) : null;  
    } catch (error) {  
        console.error(`Error retrieving score for player: ${player}`, error);  
        throw error;  
    }  
}  
  
// 示例使用  
async function main() {  
    try {  
        // 添加玩家分数  
        await putPlayerScore("player", 100);  
  
        // 获取玩家分数  
        const playerScore = await getPlayerScore("player");  
        console.log("Player score:", playerScore);  
    } catch (error) {  
        console.error("Error in main:", error);  
    }  
}  
  
// 运行示例  
main();
```

## 3. 安装相关依赖，把代码引入到项目中
```bash
pnpm add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

## 4. 改写 `src/app/api/route.ts`
```ts
// 与 dynamoDB 交互  
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";  
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";  
  
// 初始化DynamoDB客户端，包含访问密钥配置  
const client = new DynamoDBClient({  
    region: "ap-southeast-2", // 根据你的AWS区域调整  
    credentials: {  
        accessKeyId: process.env.AWS_USER_ACCESS_KEY || "",  
        secretAccessKey: process.env.AWS_USER_SECRET_ACCESS_KEY || "",  
    },  
});  
const docClient = DynamoDBDocumentClient.from(client);  
  
// 表名  
const TABLE_NAME = "blackJack";  
  
// 接口定义  
interface PlayerScore {  
    player: string;  
    score: number;  
}  
  
// 添加或更新玩家分数  
async function putPlayerScore(player: string, score: number): Promise<void> {  
    const params = {  
        TableName: TABLE_NAME,  
        Item: {  
            player,  
            score,  
        },  
    };  
  
    try {  
        await docClient.send(new PutCommand(params));  
        console.log(`Successfully saved score for player: ${player}`);  
    } catch (error) {  
        console.error(`Error saving score for player: ${player}`, error);  
        throw error;  
    }  
}  
  
// 获取玩家分数  
async function getPlayerScore(player: string): Promise<PlayerScore | null> {  
    const params = {  
        TableName: TABLE_NAME,  
        Key: {  
            player,  
        },  
    };  
  
    try {  
        const { Item } = await docClient.send(new GetCommand(params));  
        return Item ? (Item as PlayerScore) : null;  
    } catch (error) {  
        console.error(`Error retrieving score for player: ${player}`, error);  
        throw error;  
    }  
}  
  
  
  
// 游戏开始时，分别为两端获取随机卡  
export interface Card {  
    rank: string,  
    suit: string  
}  
  
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];  
const suits = ["♠️", "♣️", "♥️", "♦️"];  
const initialDeck: { rank: string, suit: string }[] = ranks.map(rank => suits.map(suit => ({  
    "rank": rank,  
    "suit": suit  
}))).flat();  
  
  
const gameState: {  
    dealerHand: Card[],  
    playerHand: Card[],  
    deck: Card[],  
    message: string,  
    score: number,  
} = {  
    dealerHand: [],  
    playerHand: [],  
    deck: initialDeck,  
    message: '',  
    score: 0,  
};  
  
function getRandomCards(deck: Card[], count: number): [Card[], Card[]] {  
    const randomIndexCards = new Set<number>();  
    while (randomIndexCards.size < count) {  
        randomIndexCards.add(Math.floor(Math.random() * deck.length));  
    }  
    const randomCards = deck.filter((_, index) => randomIndexCards.has(index));  
    const remainingCards = deck.filter((_, index) => !randomIndexCards.has(index));  
    return [randomCards, remainingCards];  
}  
  
const DEFAULT_PLAYER = "player";  
  
export async function GET() {  
    gameState.dealerHand = [];  
    gameState.playerHand = [];  
    gameState.deck = initialDeck;  
    gameState.message = "";  
  
    const [playerCards, remainingCards] = getRandomCards(gameState.deck, 2);  
    const [dealerCards, newCards] = getRandomCards(remainingCards, 2);  
    gameState.playerHand = playerCards;  
    gameState.dealerHand = dealerCards;  
    gameState.deck = newCards;  
    gameState.message = ""  
  
    try {  
        const playerScore = await getPlayerScore(DEFAULT_PLAYER);  
        gameState.score = playerScore != null ? playerScore.score | 0 : 0;  
        console.log(`Successfully get score for player: ${JSON.stringify(playerScore)}`);  
    } catch (error) {  
        console.error("Error initializing game state: ", error);  
        return new Response(JSON.stringify({ message: "error fetching score from dynamoDB" }), {  
            status: 500,  
        });  
    }  
    return new Response(JSON.stringify({  
        dealerHand: [gameState.dealerHand[0], {"rank": "?", "suit": "?"} as Card],  
        playerHand: gameState.playerHand,  
        message: gameState.message,  
        score: gameState.score,  
    }), {  
        status: 200,  
    });  
}  
  
// 当点击 hit 时，抽取一张随机卡，加入到 player 卡组中  
export async function POST(request: Request) {  
    const {action} = await request.json();  
  
    // 计算卡牌的分值  
    // 如果 分数 =21 player就赢了  
    // 如果 分数 > 21 player就输了  
    // 如果 分数是 < 21 可以继续 hit 或 stand    if (action === "hit") {  
        const [cards, newCards] = getRandomCards(gameState.deck, 1);  
        gameState.playerHand.push(...cards);  
        gameState.deck = newCards;  
        let value = calculateHandValue(gameState.playerHand);  
        if (value === 21) {  
            gameState.message = "Black Jack! Player wins!";  
            gameState.score += 100;  
        } else if (value > 21) {  
            gameState.message = "Bust! Player loses!";  
            gameState.score -= 100;  
        }  
    }  
    // 当点击 stand 时，抽取一张随机卡，加入到 hand 卡组中  
    // 直到某个卡组 >= 17 时  
    // 计算卡牌的分值  
    // 如果 分数 =21 hand就赢了  
    // 如果 分数 > 21 hand就输了  
    // 如果 分数是 < 21 可以继续 hit 或 stand    else if (action === "stand") {  
        while (calculateHandValue(gameState.dealerHand) < 17) {  
            const [cards, newCards] = getRandomCards(gameState.deck, 1);  
            gameState.dealerHand.push(...cards);  
            gameState.deck = newCards;  
        }  
        const dealerValue = calculateHandValue(gameState.dealerHand);  
        const playerValue = calculateHandValue(gameState.playerHand);  
        if (dealerValue === playerValue) {  
            gameState.message = "Draw!";  
        } else if (dealerValue > 21) {  
            gameState.message = "Dealer bust! Player wins!";  
            gameState.score += 100;  
        } else if (dealerValue === 21) {  
            gameState.message = "Dealer black jack! Player loses!";  
            gameState.score -= 100;  
        }  
        // 比较两者分值  
        else {  
            if (playerValue > dealerValue) {  
                gameState.message = "Player wins!";  
                gameState.score += 100;  
            } else if (playerValue < dealerValue) {  
                gameState.message = "Player loses!";  
                gameState.score -= 100;  
            }  
        }  
    }  
    else {  
        return new Response(JSON.stringify({message: "Invalid action"}), {status: 400});  
    }  
  
    console.log(`message=${gameState.message},   
        dealerHand=${JSON.stringify(gameState.dealerHand)}, dealerScore=${calculateHandValue(gameState.dealerHand)},  
        playerHand=${JSON.stringify(gameState.playerHand)}, playerScore=${calculateHandValue(gameState.playerHand)}`);  
    try {  
        await putPlayerScore(DEFAULT_PLAYER, gameState.score);  
    } catch(error) {  
        console.error("Error writing player score to dynamoDB: ", error);  
        return new Response(JSON.stringify({ message: "Error writing player score to dynamoDB" }), {  
            status: 500,  
        });  
    }  
  
    return new Response(JSON.stringify({  
        dealerHand: gameState.message === "" ? [gameState.dealerHand[0], {rank: "?", suit: "?"} as Card] : gameState.dealerHand,  
        playerHand: gameState.playerHand,  
        message: gameState.message,  
        score: gameState.score,  
    }), {  
        status: 200,  
    });  
}  
  
  
function calculateHandValue(playerHand: Card[]) {  
    let value = 0;  
    let aceCount = 0;  
    for (const card of playerHand) {  
        if (card.rank === "A") {  
            value += 11;  
            aceCount++;  
        } else if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {  
            value += 10;  
        } else {  
            value += parseInt(card.rank);  
        }  
    }  
    while (aceCount > 0 && value > 21) {  
        value -= 10;  
        aceCount--;  
    }  
    return value;  
}
```

# 6. 与钱包交互改造

## 1. 安装 Rainbow Kit
> 参考文档：[https://rainbowkit.com/zh-CN/docs/introduction](https://rainbowkit.com/zh-CN/docs/introduction)
> 1. 项目已经用wagmi初始化了，不用在初始化
> 2. wagmi viem@2.x @tanstack/react-query 这些依赖已经在wagmi中安装，再安装以下依赖即可

```bash
pnpm add @rainbow-me/rainbowkit
```

## 2. 引入依赖和配置  `src/app/providers.tsx`
```tsx
'use client'  
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'  
import { type ReactNode, useState } from 'react'  
import { type State, WagmiProvider } from 'wagmi'  
  
import { getConfig } from '@/wagmi'  
import '@rainbow-me/rainbowkit/styles.css';  
  
import {  
    getDefaultConfig,  
    RainbowKitProvider,  
} from '@rainbow-me/rainbowkit';  
  
export function Providers(props: {  
  children: ReactNode  
  initialState?: State  
}) {  
  const [config] = useState(() => getConfig())  
  const [queryClient] = useState(() => new QueryClient())  
  
  return (  
    <WagmiProvider config={config} initialState={props.initialState}>  
      <QueryClientProvider client={queryClient}>  
          <RainbowKitProvider>            {props.children}  
          </RainbowKitProvider>  
      </QueryClientProvider>    </WagmiProvider>  )  
}
```

## 3. 修改 page.tsx 代码
```tsx
"use client"  
import {useState, useEffect} from 'react';  
import {Card} from "@/app/api/route";  
import {ConnectButton} from "@rainbow-me/rainbowkit";  
import {useAccount, useSignMessage} from "wagmi";  
  
export default function Page() {  
    const [message, setMessage] = useState<string>();  
    const [dealerHand, setDealerHand] = useState<Card[]>([]);  
    const [playerHand, setPlayerHand] = useState<Card[]>([]);  
    const [score, setScore] = useState<number>(0);  
    const {address, isConnected} = useAccount();  
    const [isSigned, setIsSigned] = useState<boolean>(false);  
    const {signMessageAsync} = useSignMessage();  
  
    const initialGame = async () => {  
        const response = await fetch("/api", {method: "GET"});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
  
    useEffect(() => {  
        console.log(`address=${address}, isconnected=${isConnected}`);  
    }, []);  
  
    async function handleHit() {  
        const response = await fetch("/api", {method: "POST", body: JSON.stringify({ action: "hit" })});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
    async function handleStand() {  
        const response = await fetch("/api", {method: "POST", body: JSON.stringify({ action: "stand" })});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
    async function handleReset() {  
        const response = await fetch("/api", {method: "GET"});  
        const data = await response.json();  
        setDealerHand(data.dealerHand);  
        setPlayerHand(data.playerHand);  
        setMessage(data.message);  
        setScore(data.score);  
    }  
  
    async function handleSign() {  
        const message = `Welcome to the game black jack at ${new Date().toString()}`;  
        const signature = await signMessageAsync({message});  
        const response = await fetch("api", {  
            method: "POST",  
            body: JSON.stringify({  
                action: "auth",  
                address,  
                message,  
                signature  
            })  
        });  
        if (response.status === 200) {  
            setIsSigned(true);  
            await initialGame();  
        }  
    }  
  
    if (!isSigned) {  
        return (  
            <div className="flex flex-col gap-2 items-center justify-center h-screen">  
                <ConnectButton />                <button onClick={handleSign} className="border-black bg-blue-300 p-2 rounded-md">Sign with your wallet</button>  
            </div>        )  
    }  
  
    return (  
        <div className="flex flex-col gap-2 items-center justify-center h-screen">  
            <ConnectButton />            <h1 className="text-3xl"> Welcome to Web3 game Balck jack </h1>  
            <h2 className={`text-2xl ${message?.includes("wins") ? "bg-green-300" : "bg-amber-300"}`}> Score: {score} {message} </h2>  
            <div className="mt-4">  
                <h2>Dealer's hand</h2>  
                <div className="flex flex-row gap-2">  
                    {  
                        dealerHand.map((card, index) => (  
                                <div key={index}  
                                     className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">  
                                    <p className="self-start p-2 text-lg">{card.rank}</p>  
                                    <p className="self-center p-2 text-3xl">{card.suit}</p>  
                                    <p className="self-end p-2 text-lg">{card.rank}</p>  
                                </div>                            )  
                        )  
                    }  
                </div>  
            </div>            <div className="mt-2">  
                <h2>Player's hand</h2>  
                <div className="flex flex-row gap-2">  
                    {  
                        playerHand.map((card, index) => (  
                                <div key={index}  
                                     className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">  
                                    <p className="self-start p-2 text-lg">{card.rank}</p>  
                                    <p className="self-center p-2 text-3xl">{card.suit}</p>  
                                    <p className="self-end p-2 text-lg">{card.rank}</p>  
                                </div>                            )  
                        )  
                    }  
                </div>  
            </div>            <div className="flex flex-row gap-2 mt-4">  
                {  
                    message === "" ?  
                        <>  
                            <button onClick={handleHit} className="bg-blue-300 rounded-md p-2">Hit</button>  
                            <button onClick={handleStand} className="bg-blue-300 rounded-md p-2">Stand</button>  
                        </> :  
                        <button onClick={handleReset} className="bg-blue-300 rounded-md p-2">Reset</button>  
                }  
  
            </div>  
        </div>    )  
}
```

## 4. 修改 `src/app/api/route.ts`
```ts
...
import {verifyMessage} from "viem";  
  
...
  
// 当点击 hit 时，抽取一张随机卡，加入到 player 卡组中  
export async function POST(request: Request) {  
    const body = await request.json();  
    const {action} = body;  
    if (action === "auth") {  
        const {address, message, signature} = body;  
        const isValid = await verifyMessage({address, message, signature});  
        if (isValid) {  
            return new Response(JSON.stringify({message: "Valid Signature"}), {status: 200})  
        } else {  
            return new Response(JSON.stringify({message: "Invalid Signature"}), {status: 400})  
        }  
    }  
  
    ...
}
```

## 5. 测试签名登陆功能
```bash
# 启动服务
pnpm run dev
# 签名登录
```

## 6. 将玩家切换为地址，记录地址及分数
### 修改页面内容 `src/app/page.tsx`
```tsx
"use client"  
import {useAccount} from "wagmi";  
...  

export default function Page() {  
    ...  
    const {address, isConnected} = useAccount();  
  
    const initialGame = async () => {  
        const response = await fetch(`/api?address=${address}`, {method: "GET"});  
        ...  
    }  
  
  
    async function handleHit() {  
        const response = await fetch("/api?address=" + address, {method: "POST", body: JSON.stringify({ action: "hit" })});  
        ...  
    }  
    async function handleStand() {  
        const response = await fetch(`/api?address=${address}`, {method: "POST", body: JSON.stringify({ action: "stand" })});  
        ...  
    }  
    async function handleReset() {  
        const response = await fetch(`/api?address=${address}`, {method: "GET"});  
        ...  
    }  
  
    async function handleSign() {  
        ...  
        const response = await fetch(`api?address=${address}`, {  
            ...  
        })  
        ...  
    }  
    ...  
}
```

### 修改前端接口 `src/app/api/route.ts`
```ts
...  
  
export async function GET(request: Request) {  
    const url = new URL(request.url);  
    const address = url.searchParams.get("address");  
    if (!address) {  
        return new Response(JSON.stringify({ message: "Address is required" }), {  
            status: 400,  
        });  
    }  
    ...  
    try {  
        const playerScore = await getPlayerScore(address);  
        ...  
    } catch (error) {  
        ...  
    }  
    ...  
}  
  
// 当点击 hit 时，抽取一张随机卡，加入到 player 卡组中  
export async function POST(request: Request) {  
    const url = new URL(request.url);  
    const address = url.searchParams.get("address");  
    if (!address) {  
        return new Response(JSON.stringify({ message: "Address is required" }), {  
            status: 400,  
        });  
    }  
    ...  
    try {  
        await putPlayerScore(address, gameState.score);  
    } catch(error) {  
        ...  
    }  
   ...  
}  
...
```
### 测试、验证分数是否保存、验证aws是否存储
[https://ap-southeast-2.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-2#item-explorer](https://ap-southeast-2.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-2#item-explorer)

# 7. 引入jwt认证机制
## 1. 安装依赖
```bash
pnpm add jsonwebtoken @types/jsonwebtoken
```
## 2. 引入后端jwt `src/app/api/route.ts`
```ts
...  
import jwt from "jsonwebtoken";  
...  
export async function GET(request: Request) {  
    ...  
  
    const token = request.headers.get("bearer")?.split(" ")[1];  
    if (!token) {  
        return new Response(JSON.stringify({ message: "Token is required" }), {  
            status: 401,  
        });  
    }  
    const decode = jwt.verify(token, process.env.JWT_SECRET || "") as { address: string, exp: number };  
    if (decode.address.toLocaleLowerCase() !== address.toLocaleLowerCase()) {  
        return new Response(JSON.stringify({ message: "Invalid token" }), {  
            status: 401,  
        });  
    } else if (new Date().getTime() > decode.exp * 1000) {  
        return new Response(JSON.stringify({ message: "Token expired" }), { status: 401 });  
    }  
  
    ...  
}  
  
// 当点击 hit 时，抽取一张随机卡，加入到 player 卡组中  
export async function POST(request: Request) {  
    ...  
  
    const token = request.headers.get("bearer")?.split(" ")[1];  
    if (!token) {  
        return new Response(JSON.stringify({ message: "Token is required" }), {  
            status: 401,  
        });  
    }  
    const decode = jwt.verify(token, process.env.JWT_SECRET || "") as { address: string, exp: number };  
    if (decode.address.toLocaleLowerCase() !== address.toLocaleLowerCase()) {  
        return new Response(JSON.stringify({ message: "Invalid token" }), {  
            status: 401,  
        });  
    } else if (new Date().getTime() > decode.exp * 1000) {  
        return new Response(JSON.stringify({ message: "Token expired" }), { status: 401 });  
    }  
...  
}  
  
...
```

## 3. 前端加入 jwt 相关逻辑，部分逻辑优化
```tsx
"use client"  
import {useState, useEffect} from 'react';  
import {Card} from "@/app/api/route";  
import {ConnectButton} from "@rainbow-me/rainbowkit";  
import {useAccount, useSignMessage} from "wagmi";  
  
export default function Page() {  
    const [message, setMessage] = useState<string>();  
    const [dealerHand, setDealerHand] = useState<Card[]>([]);  
    const [playerHand, setPlayerHand] = useState<Card[]>([]);  
    const [score, setScore] = useState<number>(0);  
    const {address, isConnected} = useAccount();  
    const [isSigned, setIsSigned] = useState<boolean>(false);  
    const {signMessageAsync} = useSignMessage();  
  
    const initialGame = async () => {  
        const response = await fetch(`/api?address=${address}`, {  
            method: "GET",  
            headers: {  
                "bearer": `Bearer ${localStorage.getItem("jwt")}`,  
            }  
        });  
        await refreshData(response);  
    }  
  
    useEffect(() => {  
        console.log(`address=${address}, isConnected=${isConnected}`);  
    }, []);  
  
    async function handleHit() {  
        const response = await fetch("/api?address=" + address, {  
            method: "POST",  
            headers: {  
                "bearer": `Bearer ${localStorage.getItem("jwt")}`,  
            },  
            body: JSON.stringify({ action: "hit" })  
        });  
        await refreshData(response);  
    }  
    async function handleStand() {  
        const response = await fetch(`/api?address=${address}`, {  
            method: "POST",  
            headers: {  
                "bearer": `Bearer ${localStorage.getItem("jwt")}`,  
            },  
            body: JSON.stringify({ action: "stand" })  
        });  
        await refreshData(response);  
    }  
    async function handleReset() {  
        const response = await fetch(`/api?address=${address}`, {  
            method: "GET",  
            headers: {  
                "bearer": `Bearer ${localStorage.getItem("jwt")}`,  
            }  
        });  
        await refreshData(response);  
    }  
  
    async function refreshData(response: Response) {  
        if (response.status === 200) {  
            const data = await response.json();  
            setDealerHand(data.dealerHand);  
            setPlayerHand(data.playerHand);  
            setMessage(data.message);  
            setScore(data.score);  
        } else {  
            alert(`${response.status}: ${(await response.json()).message}`);  
            setIsSigned(false);  
        }  
    }  
  
    async function handleSign() {  
        const message = `Welcome to the game black jack at ${new Date().toString()}`;  
        const signature = await signMessageAsync({message});  
        const response = await fetch(`api?address=${address}`, {  
            method: "POST",  
            body: JSON.stringify({  
                action: "auth",  
                address,  
                message,  
                signature  
            })  
        });  
        if (response.status === 200) {  
            setIsSigned(true);  
            const {jsonwebtoken} = await response.json();  
            localStorage.setItem("jwt", jsonwebtoken)  
            await initialGame();  
        }  
    }  
  
    useEffect(() => {  
        if (isSigned && address) {  
            if (localStorage.getItem("jwt")) {  
                initialGame();  
            }  
        }  
        if (localStorage.getItem("jwt") && address) {  
            setIsSigned(true);  
        } else {  
            setIsSigned(false);  
            localStorage.removeItem("jwt");  
        }  
    }, [isSigned, address]);  
  
    if (!isSigned) {  
        return (  
            <div className="flex flex-col gap-2 items-center justify-center h-screen">  
                <ConnectButton />                <button onClick={handleSign} hidden={!address} className="border-black bg-blue-300 p-2 rounded-md">Sign with your wallet</button>  
            </div>        )  
    }  
  
    return ( ... )  
}
```

## 4. 测试：连接、授权、访问

# 8. 与 Lambda Functions、 Chainlink Functions 交互，实现链上数据访问链下数据
## 1. 使用 `Lambda Functions` 读取DynamoDB数据
### 1.1 创建
> [Lambda](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) -->  [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions)  --> Create function
> 进入创建的function
>  --> Code 可以查看代码片段
>  --> Configuration --> Function URL        访问 url 可以执行函数的代码

### 1.2 使用ai生成与读取dynamoDB数据的代码片段
> 参考提示词：我现在在使用aws的lambdafunction，需要写一段js代码来实现 读取 dynamoDB 中的数据，表名称是blackJack，分区名是 player，值是 数值类型的分数，现在要给定 player，然后获得 分数值

```js
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// 初始化 DynamoDB 客户端
const client = new DynamoDBClient({ region: "ap-southeast-2" }); // 替换为你的 AWS 区域，例如 "us-east-1"

export const handler = async (event) => {
    // 假设 event 中包含 player 参数，例如：{ "player": "100" }
    const player = event.headers?.player;

    if (!player) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Player is required" })
        };
    }

    // DynamoDB GetItem 参数
    const params = {
        TableName: "blackJack",
        Key: marshall({
            player: player
        })
    };

    try {
        // 执行 GetItem 操作
        const command = new GetItemCommand(params);
        const data = await client.send(command);

        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Player ${player} not found` })
            };
        }

        // 反序列化 DynamoDB 数据
        const item = unmarshall(data.Item);
        const score = item.score; // 假设分数字段名为 score

        return {
            statusCode: 200,
            body: JSON.stringify({
                player: player,
                score: score
            })
        };
    } catch (error) {
        console.error("Error reading from DynamoDB:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message })
        };
    }
};
```

### 1.3 给 lambda function 分配 dynamoDB 读取权限
>  [IAM](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/home)-->  [Roles](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/roles)  --> getPlayer-role-8igl5nfu(根据创建的函数名生成不同的角色)
>  add permissions --> Attach policies --> 分配 dynamoDB读取权限

### 1.4 将代码片段放入 code区域，访问lambda URL（加入请求头参数player），查看返回结果

## 2. Chainlink Functions
### 2.1 改写demo调用 lambda url 并加入apiKey
```js
// This functions get details about Star Wars characters. This example will showcase usage of HTTP requests and console.logs.
// 1, 2, 3 etc.
const player = args[0];
const apiKey = secrets.apiKey;
if (!apiKey) {
    throw Error("api key should be provided!")
}

// Execute the API request (Promise)
const apiResponse = await Functions.makeHttpRequest({
  url: `https://ijljpsimwjosqm543hvzwjhtp40pfinj.lambda-url.us-east-1.on.aws/`,
  method: "GET",
  headers: {
    "player": player,
    "api_key": apiKey
  }
})

if (apiResponse.error) {
  console.error(apiResponse.error)
  throw Error("Request failed")
}

const { data } = apiResponse;

console.log('API response data:', JSON.stringify(data));

// Return Character Name
return Functions.encodeInt256(data.score)
```

> Argument 填入 player 地址
> Secret 填入 apiKey 和 对应的值

### 2.2 lambda function 的代码也要调整

```js
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// 初始化 DynamoDB 客户端
const client = new DynamoDBClient({ region: "ap-southeast-2" }); // 替换为你的 AWS 区域，例如 "us-east-1"
const API_KEY = "9124305f65052bb88568ea0d33fe94fa42aecfbbb2c17159aeb1c0bcbf85511d";

export const handler = async (event) => {
    // 假设 event 中包含 player 参数，例如：{ "player": "player123" }
    const player = event.headers?.player;
    const apiKey = event.headers?.api_key;

    if (API_KEY !== apiKey) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized" })
        };
    }

    ...
};
```

### 2.3 Run code 测试运行结果


## 3. 改造 Chainlink Functions 合约示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract FunctionsConsumerExample is FunctionsClient, ConfirmedOwner, ERC721URIStorage {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    mapping(bytes32 reqId => address player) private reqIdToPlayer;

    // 之前改造的示例代码
    string constant SOURCE = 
        "const player=args[0],apiKey=secrets.apiKey;"
        "if(!apiKey)throw Error('api key should be provided!');"
        "const apiResponse=await Functions.makeHttpRequest({url:'https://ijljpsimwjosqm543hvzwjhtp40pfinj.lambda-url.us-east-1.on.aws/',method:'GET',headers:{'player':player,'api_key':apiKey}});"
        "if(apiResponse.error)throw Error('Request failed');"
        "return Functions.encodeInt256(apiResponse.data.score);";
    uint32 constant GAS_LIMIT = 300_000;
    // 和链有关，可在此处查看：https://docs.chain.link/chainlink-functions/supported-networks
    bytes32 constant DON_ID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;
    string constant META_DATA = "ipfs://QmYQfNTM2GXzRTwxsK2YcEBT2pDQGyapbGEj4VSPAhFwuL";
    address constant ROUTER = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;

    uint8 private donHostedSecretsSlotID;
    uint64 private donHostedSecretsVersion;
    uint64 private subscriptionId;
    uint256 private _nextTokenId;


    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor() FunctionsClient(ROUTER) ConfirmedOwner(msg.sender) ERC721("BlackJack", "BJK") {}

    function setDonHostSecretConfig(uint8 _donHostedSecretsSlotID, uint64 _donHostedSecretsVersion, uint64 _subscriptionId) public onlyOwner {
        donHostedSecretsSlotID = _donHostedSecretsSlotID;
        donHostedSecretsVersion = _donHostedSecretsVersion;
        subscriptionId = _subscriptionId;
    }

    /**
     * @notice Send a simple request
     * @param args List of arguments accessible from within the source code
     */
    function sendRequest(
        string[] memory args,
        address player
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE);
        req.addDONHostedSecrets(
            donHostedSecretsSlotID,
            donHostedSecretsVersion
        );
        if (args.length > 0) req.setArgs(args);
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            GAS_LIMIT,
            DON_ID
        );

        reqIdToPlayer[s_lastRequestId] = player;
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        s_lastError = err;

        int256 score = abi.decode(response, (int256));
        if (score >= 1000) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(reqIdToPlayer[s_lastRequestId], tokenId);
            _setTokenURI(tokenId, "META_DATA");
            emit Response(requestId, s_lastResponse, s_lastError);
        }
    }
}
```

> 在 [remix](https://remix.ethereum.org/) 部署合约
## 4. 创建订阅
> [https://functions.chain.link/fuji/15746](https://functions.chain.link/fuji/15746)
> 合约地址为第3步部署的合约

## 5. 使用脚本获得 version 和 slotId
### 5.1 创建脚本 uploadSecretToDON.js
```js
import { SecretsManager } from "@chainlink/functions-toolkit";  
import { ethers } from "ethers";  
import dotenv from "dotenv";  
import fs from "fs";  
  
dotenv.config({path: "./.env.local"});  
  
const makeRequestSepolia = async () => {  
    if (!process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI) {  
        throw new Error("ETHEREUM_PROVIDER_AVALANCHEFUJI not provided - check your environment variables");  
    }  
    if (!process.env.AWS_API_KEY) {  
        throw new Error("AWS_API_KEY not provided - check your environment variables");  
    }  
    if (!process.env.EVM_PRIVATE_KEY) {  
        throw new Error("EVM_PRIVATE_KEY not provided - check your environment variables");  
    }  
  
    // hardcoded for Avalanche Fuji  
    const routerAddress = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0";  
    const donId = "fun-avalanche-fuji-1";  
    const rpcUrl = process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI; // fetch Sepolia RPC URL  
  
    const gatewayUrls = [  
        "https://01.functions-gateway.testnet.chain.link/",  
        "https://02.functions-gateway.testnet.chain.link/",  
    ];  
    const slotIdNumber = 0;  
    const expirationTimeMinutes = 1440;  
  
    const secrets = { apiKey: process.env.AWS_API_KEY };  
  
    // Initialize ethers signer and provider to interact with the contracts onchain  
    const privateKey = process.env.EVM_PRIVATE_KEY; // fetch EVM_PRIVATE_KEY  
    if (!privateKey) throw new Error("private key not provided - check your environment variables");  
  
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);  
  
    const wallet = new ethers.Wallet(privateKey);  
    const signer = wallet.connect(provider); // create ethers signer for signing transactions  
  
    //////// MAKE REQUEST ////////  
    console.log("\nMake request...");  
  
    // First encrypt secrets and create a gist  
    const secretsManager = new SecretsManager({  
        signer: signer,  
        functionsRouterAddress: routerAddress,  
        donId: donId,  
    });  
    await secretsManager.initialize();  
  
    // Encrypt secrets  
    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);  
  
    console.log(  
        `Upload encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`  
    );  
  
    // Upload secrets  
    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({  
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,  
        gatewayUrls: gatewayUrls,  
        slotId: slotIdNumber,  
        minutesUntilExpiration: expirationTimeMinutes,  
    });  
  
    if (!uploadResult.success) throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`);  
  
    console.log(`\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `, uploadResult);  
  
    const donHostedSecretsVersion = parseInt(uploadResult.version); // fetch the reference of the encrypted secrets  
  
    // Save info in case we clear console    fs.writeFileSync(  
        "donSecretsInfo.txt",  
        JSON.stringify(  
            {  
                donHostedSecretsVersion: donHostedSecretsVersion.toString(),  
                slotId: slotIdNumber.toString(),  
                expirationTimeMinutes: expirationTimeMinutes.toString(),  
            },  
            null,            2  
        )  
    );  
  
    console.log(`donHostedSecretsVersion is ${donHostedSecretsVersion},  Saved info to donSecretsInfo.txt`);  
};  
  
makeRequestSepolia().catch(e => {  
    console.error(e);  
    process.exit(1);  
});
```

### 5.2 安装依赖
```bash
pnpm add @chainlink/functions-toolkit ethers@5 dotenv
```

### 5.3 添加环境变量
```config
ETHEREUM_PROVIDER_AVALANCHEFUJI=... 
AWS_API_KEY=...  
EVM_PRIVATE_KEY=...
```

### 5.4 执行脚本
```bash
node uploadSecretToDON.js
```
> 会生成 donSecretsInfo.txt 文件
> ```
> {  
	  "donHostedSecretsVersion": "1758512792",  
	  "slotId": "0",  
	  "expirationTimeMinutes": "1440"  
	}
> ```

### 5.5 使用remix调用合约的 `setDonHostSecretConfig` 函数
> 传入 `soltId`、`version`、`SubscriptionID`

### 5.6 使用remix调用 `sendRequest` 测试发送消息
> ⚠️ 需要现修改 DynamoDB 中 地址的分数为1000
> DynamoDB-> Explore items --> blackJack    进行修改

参数传 `["0x0ad4f2C9A4Ee0E3E640532002B6bf6E468BD233A"]` 和`0x0ad4f2C9A4Ee0E3E640532002B6bf6E468BD233A`，签名发送交易

### 5.7 验证是否成功得到 nft
> 打开浏览器查看地址信息：[https://testnet.snowscan.xyz/address/0x0ad4f2c9a4ee0e3e640532002b6bf6e468bd233a#nfttransfers](https://testnet.snowscan.xyz/address/0x0ad4f2c9a4ee0e3e640532002b6bf6e468bd233a#nfttransfers)


# 9. 前端页面调用合约实现铸造NFT
## 1. 引入 [Viem parseAbi](https://v1.viem.sh/docs/abi/parseAbi.html) 用来解析合约abi、编写调用合约代码
### 1.1 修改 src/app/page.tsx 文件
```tsx
"use client"  
import {useState, useEffect} from 'react';  
import {Card} from "@/app/api/route";  
import {ConnectButton} from "@rainbow-me/rainbowkit";  
import {useAccount, useSignMessage} from "wagmi";  
import {parseAbi, createPublicClient, createWalletClient, custom} from "viem";  
import {avalancheFuji} from "viem/chains";  
  
export default function Page() {  
    const [message, setMessage] = useState<string>();  
    const [dealerHand, setDealerHand] = useState<Card[]>([]);  
    const [playerHand, setPlayerHand] = useState<Card[]>([]);  
    const [score, setScore] = useState<number>(0);  
    const {address, isConnected} = useAccount();  
    const [isSigned, setIsSigned] = useState<boolean>(false);  
    const {signMessageAsync} = useSignMessage();  
    const [publicClient, setPublicClient] = useState<any>(null);  
    const [walletClient, setWalletClient] = useState<any>(null);  
  
    const initialGame = async () => {  
        const response = await fetch(`/api?address=${address}`, {  
            method: "GET",  
            headers: {  
                "bearer": `Bearer ${localStorage.getItem("jwt")}`,  
            }  
        });  
        await refreshData(response);  
  
        if (typeof window !== "undefined" && window.ethereum) {  
            const pc = createPublicClient({  
                chain: avalancheFuji,  
                transport: custom(window.ethereum)  
            });  
            const wc = createWalletClient({  
                chain: avalancheFuji,  
                transport: custom(window.ethereum)  
            });  
            setPublicClient(() => pc);  
            setWalletClient(wc);  
        } else {  
            console.error("window.ethereum is not available!");  
        }  
    }  
  
    async function handleSignTx() {  
        // 1. 获取合约地址  
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;  
        // 2. 获取 abi （至少需要sendRequest函数的）  
        const contractAbi = parseAbi([process.env.NEXT_PUBLIC_CONTRACT_ABI || ""]);  
        // 3. 模拟交易：publicClient --> simulateContract  
        const res = await publicClient.simulateContract({  
            address: contractAddress as `0x${string}`,  
            abi: contractAbi,  
            functionName: "sendRequest",  
            args: [[address], address],  
            account: address,  
        });  
        console.log("模拟交易结果：", JSON.stringify(res));  
        // 4. 发送交易：walletClient --> writeContract  
        const txHash = await walletClient.writeContract({  
            address: contractAddress,  
            abi: contractAbi,  
            functionName: "sendRequest",  
            args: [[address], address],  
            account: address,  
        });  
        const args = [address]  
        console.log("调用 sendRequest 成功，txHash =", txHash);  
    }  
  
  
    ...
  
    return (  
        <div className="flex flex-col gap-2 items-center justify-center h-screen">  
            <ConnectButton />            <h1 className="text-3xl"> Welcome to Web3 game Balck jack </h1>  
            <h2 className={`text-2xl ${message?.includes("wins") ? "bg-green-300" : "bg-amber-300"}`}> Score: {score} {message} </h2>  
            <button onClick={handleSignTx} className="border-black bg-blue-300 p-2 rounded-md">Get NFT</button>  
            ... 
        </div>    )  
}
```

### 1.2 添加配置  .env.local
```config
...

NEXT_PUBLIC_CONTRACT_ADDRESS=0xA41f3fc1199F38214cEe40771D6a08ba5Eb28284  
NEXT_PUBLIC_CONTRACT_ABI="function sendRequest(string[] memory args, address player) external returns (bytes32)"
```

### 1.3 添加 avalancheFuji网络    wagmi.ts
```ts
...
import { mainnet, sepolia, avalancheFuji } from 'wagmi/chains'  
...
  
export function getConfig() {  
  return createConfig({  
    chains: [mainnet, sepolia, avalancheFuji],  
    ...,  
    transports: {  
      [mainnet.id]: http(),  
      [sepolia.id]: http(),  
      [avalancheFuji.id]: http(),  
    },  
  })  
}  
  
...
```

## 3. 测试获取 nft 功能
> 点击 "Get NFT" 签名交易   --> 查看交易状态 --> [chainlink function](https://functions.chain.link/fuji/15746)查看执行情况 --> 检查地址是否获得NFT


# 9. 美化页面
> 使用 [https://lovable.dev](https://lovable.dev/) ai 工具
> 参考提示词：我在使用 wagmi, rainbowkit,tailwindcss 开发一个blackjack 的游戏，请我们修改前端页面，让我的页面更加的用户友好，使得页面的布局和配色更加的美丽，让按钮更加有点击感，或许加入isloading 的提示。请只修改 page.tsx，不要引入新的文件。以下是我的前端页面page.tsx:
