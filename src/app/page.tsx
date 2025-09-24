"use client"
import {useState, useEffect} from 'react';
import {Card} from "@/app/api/route";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {useAccount, useSignMessage} from "wagmi";

export default function Page() {
    const [message, setMessage] = useState<string>();
    const [dealerHead, setDealerHead] = useState<Card[]>([]);
    const [playerHead, setPlayerHead] = useState<Card[]>([]);
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