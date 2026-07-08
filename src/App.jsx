import { useState } from "react";
import { ethers } from "ethers";
import escrowAbi from "./EscrowABI.json";

const CONTRACT_ADDRESS = "0xDa7F4344d16fBAbE80174e3804ae3ABD30C87502";

function App() {
  const [account, setAccount] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [contract, setContract] = useState(null);

  // Mapa stanja za lepsi prikaz na ekranu
  const stanja = ["Created", "Funded", "Completed", "InDispute", "Resolved"];

  // Povezivanje sa MetaMaskom
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // 1. Inicijalizacija provajdera za ethers v5
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // 2. Traženje dozvole od korisnika da poveže novčanik
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // 3. Uzimanje signera (potpisnika) i adrese
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        // 4. Inicijalizacija ugovora
        const escrowContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          escrowAbi,
          signer,
        );
        setContract(escrowContract);

        // 5. Čitanje trenutnog stanja
        const txDetails = await escrowContract.transaction();
        setCurrentState(stanja[Number(txDetails.currentState)]);
      } catch (error) {
        console.error("Greška pri povezivanju novčanika:", error);
        alert("Došlo je do greške prilikom povezivanja sa MetaMask-om.");
      }
    } else {
      alert("Molimo instalirajte MetaMask!");
    }
  };

  // Funkcija za oslobadjanje sredstava
  const releaseFunds = async () => {
    try {
      const tx = await contract.releaseFunds();
      await tx.wait(); // Cekamo da se transakcija potvrdi na mrezi
      alert("Sredstva su uspesno oslobodjena prodavcu!");
      connectWallet(); // Osvezavamo stanje na ekranu
    } catch (err) {
      alert("Greska: " + err.reason || err.message);
    }
  };

  // Funkcija za pokretanje spora
  const raiseDispute = async () => {
    try {
      const tx = await contract.raiseDispute();
      await tx.wait();
      alert("Spor je uspesno pokrenut!");
      connectWallet();
    } catch (err) {
      alert("Greska: " + err.reason || err.message);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>Escrow dApp sa Arbitražom</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Poveži MetaMask novčanik
        </button>
      ) : (
        <div>
          <p>
            <strong>Tvoja adresa:</strong> {account}
          </p>
          <p>
            <strong>Trenutno stanje ugovora:</strong>{" "}
            <span style={{ color: "blue", fontWeight: "bold" }}>
              {currentState}
            </span>
          </p>

          <hr style={{ margin: "20px 0" }} />

          <div
            style={{ display: "flex", gap: "20px", justifyContent: "center" }}
          >
            <button
              onClick={releaseFunds}
              style={{
                background: "green",
                color: "white",
                padding: "10px 20px",
              }}
            >
              Potvrdi prijem i isplati prodavca (Kupac)
            </button>

            <button
              onClick={raiseDispute}
              style={{
                background: "orange",
                color: "white",
                padding: "10px 20px",
              }}
            >
              Pokreni spor (Kupac/Prodavac)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
