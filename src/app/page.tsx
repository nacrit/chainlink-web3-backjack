"use client"
import {useState, useEffect} from 'react';
import {Card} from "@/app/api/route";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {useAccount, useSignMessage} from "wagmi";
import {parseAbi, createPublicClient, createWalletClient, custom} from "viem";
import {avalancheFuji} from "viem/chains";

export default function Page() {
    const [message, setMessage] = useState<string>();
    const [dealerHead, setDealerHead] = useState<Card[]>([]);
    const [playerHead, setPlayerHead] = useState<Card[]>([]);
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
        console.log("调用 sendRequest 成功，txHash =", txHash);
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
            setDealerHead(data.dealerHead);
            setPlayerHead(data.playerHead);
            setMessage(data.message);
            setScore(data.score);
        } else {
            localStorage.removeItem("jwt");
            setIsSigned(false);
            alert(`${response.status}: ${(await response.json()).message}`);
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
                <ConnectButton />
                <button onClick={handleSign} hidden={!address} className="border-black bg-blue-300 p-2 rounded-md">Sign with your wallet</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 items-center justify-center h-screen">
            <ConnectButton />
            <h1 className="text-3xl"> Welcome to Web3 game Balck jack </h1>
            <h2 className={`text-2xl ${message?.includes("wins") ? "bg-green-300" : "bg-amber-300"}`}> Score: {score} {message} </h2>
            <button onClick={handleSignTx} className="border-black bg-blue-300 p-2 rounded-md">Get NFT</button>
            <div className="mt-4">
                <h2>Dealer's hand</h2>
                <div className="flex flex-row gap-2">
                    {
                        dealerHead.map((card, index) => (
                                <div key={index}
                                     className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">
                                    <p className="self-start p-2 text-lg">{card.rank}</p>
                                    <p className="self-center p-2 text-3xl">{card.suit}</p>
                                    <p className="self-end p-2 text-lg">{card.rank}</p>
                                </div>
                            )
                        )
                    }
                </div>
            </div>
            <div className="mt-2">
                <h2>Player's hand</h2>
                <div className="flex flex-row gap-2">
                    {
                        playerHead.map((card, index) => (
                                <div key={index}
                                     className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">
                                    <p className="self-start p-2 text-lg">{card.rank}</p>
                                    <p className="self-center p-2 text-3xl">{card.suit}</p>
                                    <p className="self-end p-2 text-lg">{card.rank}</p>
                                </div>
                            )
                        )
                    }
                </div>
            </div>
            <div className="flex flex-row gap-2 mt-4">
                {
                    message === "" ?
                        <>
                            <button onClick={handleHit} className="bg-blue-300 rounded-md p-2">Hit</button>
                            <button onClick={handleStand} className="bg-blue-300 rounded-md p-2">Stand</button>
                        </> :
                        <button onClick={handleReset} className="bg-blue-300 rounded-md p-2">Reset</button>
                }

            </div>
        </div>
    )
}