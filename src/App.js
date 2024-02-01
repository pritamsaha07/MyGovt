import './App.css';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import ABI from './abi.json';

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });
  const [connected, setConnected] = useState(false);
  const [newProp, setNewProp] = useState('');
  const [address, setNewAddress] = useState('');
  const [newConsent, setNewConsent] = useState('');
  const [forVotes, setForVotes] = useState(0);
  const [againstVotes, setAgainstVotes] = useState(0);

  useEffect(() => {
    const loadProvider = async () => {
      let provider = null;
      if (window.ethereum) {
        provider = window.ethereum;
      }
      if (window.web3) {
        provider = window.web3.currentProvider;
      } else if (!process.env.production) {
        provider = new Web3.provider.HttpProvider('http://localhost:7545');
      }
      const web3loader = new Web3(provider);
      const abi = ABI;
      const address = '0xb6650fBb3718AE3951e27A5d7FFe7b2490C3F62f';
      const contract1 = await new web3loader.eth.Contract(abi, address);
      console.log(provider);
      setWeb3Api({
        provider: provider,
        web3: web3loader,
        contract: contract1,
      });
      console.log(contract1);
    };
    loadProvider();
  }, []);

  const [account, setAccount] = useState(null);
  useEffect(() => {
    const getAccount = async () => {
      const account = await web3Api.web3.eth.getAccounts();
      setAccount(account[0]);
      console.log(account);
    };

    web3Api.web3 && getAccount();
  }, [web3Api.web3]);

 
  const createProposal = async () => {
    try {
      const result = await web3Api.contract.methods.createProposal(newProp).send({ from: account });
      console.log('Proposal created:', result);
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  async function vote() {
    try {
      const result = await web3Api.contract.methods.vote(address, true).send({ from: account });
      console.log('Voted:', result);
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  async function cancelProposal() {
    try {
      const result = await web3Api.contract.methods.cancelProposal().send({ from: account });
      console.log('Proposal cancelled:', result);
    } catch (error) {
      console.error('Error cancelling proposal:', error);
    }
  }

  async function executeProposal() {
    try {
      const result = await web3Api.contract.methods.executeProposal().send({ from: account });
      console.log('Proposal executed:', result);
    } catch (error) {
      console.error('Error executing proposal:', error);
    }
  }

  async function getFor() {
    try {
      const result = await web3Api.contract.methods.getForvote().call({ from: account });
      console.log(typeof result);
      
      const num = Number(result);     
      setForVotes(num);
      console.log('For votes:', result);
    } catch (error) {
      console.error('Error fetching for votes:', error);
    }
  }

  async function getAgainst() {
    try {
      const result = await web3Api.contract.methods.getAgainstvote().call({ from: account });
      setAgainstVotes(result);
      console.log('Against votes:', result);
    } catch (error) {
      console.error('Error fetching against votes:', error);
    }
  }
  useEffect(()=>{
    getFor();
  })

  return (
    <>
      <nav>
        <button
          onClick={async () => {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setConnected(true);
            console.log(accounts);
          }}
          disabled={connected}
        >
          Connect to MetaMask
        </button>
      </nav>

      <h2>For votes: {forVotes}</h2>
      <h2>Against votes: {againstVotes}</h2>

      <input type="text" placeholder='Enter Your Message' value={newProp} onChange={(e) => setNewProp(e.target.value)} />
      <button onClick={createProposal}>Create Proposal</button>
      <div>
        <input type="text" placeholder='Enter address' value={address} onChange={(e) => setNewAddress(e.target.value)} />
        <input type="text" placeholder='Enter consent' value={newConsent} onChange={(e) => setNewConsent(e.target.value)} />
        <button onClick={vote}>Add Vote</button>
      </div>

      <button onClick={cancelProposal}>Cancel Proposal</button>
      <button onClick={executeProposal}>Execute Proposal</button>
    </>
  );
}

export default App;
