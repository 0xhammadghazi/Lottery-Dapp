import "./App.css";
import Web3 from "web3";
import { useState } from "react";

import Enter from "./components/EnterForm.js";
import Table from "./components/Table.js";
import Bottom from "./components/Bottom.js";
import Top from "./components/Top.js";
import Winner from "./components/Winner.js";
import Warning from "./components/Warning.js";

let web3;
let contract;
const lotteryABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_randomContractAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkRequested",
    type: "event",
  },
  {
    inputs: [],
    name: "enterLottery",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_randomNumber",
        type: "uint256",
      },
    ],
    name: "finalizeRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_requestId",
        type: "bytes32",
      },
    ],
    name: "fulfill_alarm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [],
    name: "NewRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalPlayers",
        type: "uint256",
      },
    ],
    name: "PlayerEntered",
    type: "event",
  },
  {
    inputs: [],
    name: "triggerLottery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
    ],
    name: "WinnerAnnounced",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "contractCreator",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getParticipants",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "participants",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const lotteryAddress = "0x43e9a518643eC7D093A6178Aa9B14b995cF860f8";
function App() {
  //setting web3 provider on page load
  window.addEventListener("load", async () => {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        loadBlockchainData();
      } catch (error) {
        if (error.code === 4001) {
          alert("Request to access account denied!");
        }
      }
    } else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
      loadBlockchainData();
    } else {
      alert(
        "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!"
      );
    }
  });

  if (web3 != undefined) {
    // detect Network account change
    window.ethereum.on("networkChanged", function (networkId) {
      if (networkId === 1) {
        setNetwork("Main");
      } else if (networkId === 3) {
        setNetwork("Ropsten");
      } else if (networkId === 4) {
        setNetwork("Rinkeby");
      } else if (networkId === 5) {
        setNetwork("Goerli");
      } else {
        setNetwork(null);
        loadBlockchainData();
      }
    });
  }

  const [participants, setParticipants] = useState(0);
  const [pot, setPot] = useState(0);
  const [network, setNetwork] = useState(null);

  async function loadBlockchainData() {
    contract = new web3.eth.Contract(lotteryABI, lotteryAddress);
    let network = await web3.eth.net.getNetworkType();

    //only update state when network is not kovan
    if (network !== "kovan") {
      //to convert first letter of network into Upper case
      network =
        network.charAt(0).toUpperCase() + network.substr(1).toLowerCase();
      setNetwork(network);
    }
    setParticipants(await contract.methods.getParticipants().call());
    let totalPot = await web3.eth.getBalance(contract.options.address);
    totalPot = web3.utils.fromWei(totalPot, "Ether");
    setPot(totalPot);

    /*following event will be emitted by the smart contract whenever a new player will enter the lottery,
    listening to that event, to update players count and total lottery pot*/
    contract.events
      .PlayerEntered()
      .on("data", async function (result) {
        totalPot = result.returnValues[0];
        totalPot = web3.utils.fromWei(totalPot, "Ether");
        setPot(totalPot);
        setParticipants(result.returnValues[1]);
      })
      .on("error", console.error);

    /*following event will be emitted by our smart contract, 
    to let us know which address has won current lottery round*/
    contract.events
      .WinnerAnnounced()
      .on("data", async function (result) {
        alert(result.returnValues[0] + " has won the lottery!");
      })
      .on("error", console.error);

    /*following event will be emitted when a new round of lottery is started,
      so we can reset lottery pot and participants*/
    contract.events
      .NewRound()
      .on("data", async function (result) {
        setPot(0);
        setParticipants(0);
      })
      .on("error", console.error);
  }

  //when user clicks on enter button
  async function onSubmit(event) {
    event.preventDefault();
    try {
      //throw error if entered value is less than 0.01
      if (0.01 > document.getElementById("inputField").value) {
        alert("Minimum amount to enter lottery is 0.01 ether");
      } else {
        //accessing user account
        const account = await web3.eth.getAccounts();
        let amount = document.getElementById("inputField").value;
        amount = amount.toString();
        await contract.methods.enterLottery().send({
          from: account[0],
          value: web3.utils.toWei(amount, "Ether"), //converting amount from ether to wei
          gasLimit: web3.utils.toHex(3000000),
        });
      }
    } catch (error) {
      if (error.code === 4001) {
        alert("Request to access account denied!");
      }
    }
  }

  return (
    <div className="App">
      <Top />
      <Winner />
      <Warning Network={network} />
      <Table pot={pot} participants={participants} />
      <Enter handleSubmit={onSubmit} />
      <Bottom />
    </div>
  );
}

export default App;
