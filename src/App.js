import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokenAddress = "0xb19503287BA909aa55b48B747fa363aa1dE5c9D0";
const stakingAddress = "0x1bFFEEBcbDc1b3D549ECECd130b1Ed1821F6bE23";

const tokenAbi = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];
const stakingAbi = [
  "function stake(uint256 _amount) public",
  "function unstake() public",
  "function getReward(address user) public view returns (uint256)",
  "function getStakedAmount(address user) public view returns (uint256)"
];

function App() {
  const [wallet, setWallet] = useState(null);
  const [reward, setReward] = useState("0");
  const [stakedAmount, setStakedAmount] = useState("0");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setWallet({ provider, signer, address: accounts[0] });
    } else {
      alert("🦊 메타마스크를 설치해주세요!");
    }
  };

  const stakeTokens = async () => {
    if (!wallet) return;
    const amount = prompt("스테이킹할 NVA 수량을 입력하세요:");
    if (!amount) return;
    const parsedAmount = ethers.parseUnits(amount, 18);

    const token = new ethers.Contract(tokenAddress, tokenAbi, wallet.signer);
    const tx1 = await token.approve(stakingAddress, parsedAmount);
    await tx1.wait();

    const staking = new ethers.Contract(stakingAddress, stakingAbi, wallet.signer);
    const tx2 = await staking.stake(parsedAmount);
    await tx2.wait();

    alert("✅ 스테이킹 완료!");
    fetchInfo();
  };

  const unstakeTokens = async () => {
    if (!wallet) return;
    const staking = new ethers.Contract(stakingAddress, stakingAbi, wallet.signer);
    const tx = await staking.unstake();
    await tx.wait();
    alert("✅ 언스테이킹 완료!");
    fetchInfo();
  };

  const fetchInfo = async () => {
    if (!wallet) return;
    const staking = new ethers.Contract(stakingAddress, stakingAbi, wallet.provider);
    const reward = await staking.getReward(wallet.address);
    const staked = await staking.getStakedAmount(wallet.address);
    setReward(ethers.formatUnits(reward, 18));
    setStakedAmount(ethers.formatUnits(staked, 18));
  };

  useEffect(() => {
    if (wallet) {
      fetchInfo();
      const interval = setInterval(fetchInfo, 10000);
      return () => clearInterval(interval);
    }
  }, [wallet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white font-orbitron flex flex-col items-center justify-center p-6">
      <div className="bg-white bg-opacity-10 p-8 rounded-xl shadow-lg w-full max-w-md backdrop-blur-md">
        <h1 className="text-4xl font-bold text-center text-purple-300 mb-6">🚀 NOVA Staking</h1>

        {wallet ? (
          <>
            <p className="text-sm text-center mb-2">🦊 <span className="text-green-400">{wallet.address}</span></p>
            <p className="text-lg text-center">💰 예치 수량: <span className="text-yellow-300">{stakedAmount} NVA</span></p>
            <p className="text-lg text-center mb-6">🎁 누적 보상: <span className="text-cyan-300">{reward} NVA</span></p>

            <div className="flex gap-4 justify-center">
              <button onClick={stakeTokens} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition">
                🔒 Stake
              </button>
              <button onClick={unstakeTokens} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition">
                💸 Unstake
              </button>
            </div>
          </>
        ) : (
          <button onClick={connectWallet} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded text-lg">
            🦊 메타마스크 연결
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
