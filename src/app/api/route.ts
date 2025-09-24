import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {verifyMessage} from "viem";
import jwt from "jsonwebtoken";

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
    dealerHead: Card[],
    playerHead: Card[],
    deck: Card[],
    message: string,
    score: number,
} = {
    dealerHead: [],
    playerHead: [],
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

export async function GET(request: Request) {
    const url = new URL(request.url);
    const address = url.searchParams.get("address");
    console.log("url =", url, ", address=", address);
    if (!address) {
        return new Response(JSON.stringify({ message: "Address is required" }), {
            status: 400,
        });
    }

    const token = request.headers.get("bearer")?.split(" ")[1];
    if (!token) {
        return new Response(JSON.stringify({ message: "Token is required" }), {
            status: 401,
        });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET || "") as { address: string, exp: number };
        if (decode.address.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
            return new Response(JSON.stringify({ message: "Invalid token" }), {
                status: 401,
            });
        }
    } catch (error: any) {
        // error: {"name":"JsonWebTokenError","message":"jwt malformed"} // token格式不对
        // error: {"name":"JsonWebTokenError","message":"invalid signature"} // 无效的token
        // error: {"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2025-09-24T07:28:55.000Z"} // token过期
        return new Response(JSON.stringify({ message: "Invalid token, error: " + JSON.stringify(error) }), {
            status: 401,
        });
    }

    gameState.dealerHead = [];
    gameState.playerHead = [];
    gameState.deck = initialDeck;
    gameState.message = "";

    const [playerCards, remainingCards] = getRandomCards(gameState.deck, 2);
    const [dealerCards, newCards] = getRandomCards(remainingCards, 2);
    gameState.playerHead = playerCards;
    gameState.dealerHead = dealerCards;
    gameState.deck = newCards;
    gameState.message = ""

    try {
        const playerScore = await getPlayerScore(address);
        gameState.score = playerScore != null ? playerScore.score | 0 : 0;
        console.log(`Successfully get score for player: ${JSON.stringify(playerScore)}`);
    } catch (error) {
        console.error("Error initializing game state: ", error);
        return new Response(JSON.stringify({ message: "error fetching score from dynamoDB" }), {
            status: 500,
        });
    }
    return new Response(JSON.stringify({
        dealerHead: [gameState.dealerHead[0], {"rank": "?", "suit": "?"} as Card],
        playerHead: gameState.playerHead,
        message: gameState.message,
        score: gameState.score,
    }), {
        status: 200,
    });
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

    const body = await request.json();
    const {action} = body;
    if (action === "auth") {
        const {address, message, signature} = body;
        const isValid = await verifyMessage({address, message, signature});
        if (isValid) {
            const token = jwt.sign({address}, process.env.JWT_SECRET || "", {expiresIn: "1h"});
            return new Response(JSON.stringify({
                message: "Valid Signature",
                jsonwebtoken: token,
            }), {status: 200})
        } else {
            return new Response(JSON.stringify({message: "Invalid Signature"}), {status: 400})
        }
    }


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

    // 计算卡牌的分值
    // 如果 分数 =21 player就赢了
    // 如果 分数 > 21 player就输了
    // 如果 分数是 < 21 可以继续 hit 或 stand
    if (action === "hit") {
        const [cards, newCards] = getRandomCards(gameState.deck, 1);
        gameState.playerHead.push(...cards);
        gameState.deck = newCards;
        let value = calculateHandValue(gameState.playerHead);
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
    // 如果 分数是 < 21 可以继续 hit 或 stand
    else if (action === "stand") {
        while (calculateHandValue(gameState.dealerHead) < 17) {
            const [cards, newCards] = getRandomCards(gameState.deck, 1);
            gameState.dealerHead.push(...cards);
            gameState.deck = newCards;
        }
        const dealerValue = calculateHandValue(gameState.dealerHead);
        const playerValue = calculateHandValue(gameState.playerHead);
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
        dealerHead=${JSON.stringify(gameState.dealerHead)}, dealerScore=${calculateHandValue(gameState.dealerHead)},
        playerHead=${JSON.stringify(gameState.playerHead)}, playerScore=${calculateHandValue(gameState.playerHead)}`);
    try {
        await putPlayerScore(address, gameState.score);
    } catch(error) {
        console.error("Error writing player score to dynamoDB: ", error);
        return new Response(JSON.stringify({ message: "Error writing player score to dynamoDB" }), {
            status: 500,
        });
    }

    return new Response(JSON.stringify({
        dealerHead: gameState.message === "" ? [gameState.dealerHead[0], {rank: "?", suit: "?"} as Card] : gameState.dealerHead,
        playerHead: gameState.playerHead,
        message: gameState.message,
        score: gameState.score,
    }), {
        status: 200,
    });
}


function calculateHandValue(playerHead: Card[]) {
    let value = 0;
    let aceCount = 0;
    for (const card of playerHead) {
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
