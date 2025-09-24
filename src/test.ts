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