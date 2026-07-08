import { useState } from "react";
import { ethers } from "ethers";
import escrowAbi from "./EscrowABI.json";

const CONTRACT_ADDRESS = "0x52F16f4fa84C1Fb4AF844D933B1B227f066e5CAd";

const ADRESA_KUPCA = "0x7409f06651ec8A935D51E9EA8878b5027c8C5329".toLowerCase();
const ADRESA_PRODAVCA =
  "0x3eAaEFd755E0a85ECDc901149D2111263668F970".toLowerCase();
const ADRESA_ARBITRA =
  "0x87A6Fb4A9E91B06Ec0C952677e22289c4863B790".toLowerCase();

function App() {
  const [account, setAccount] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [contract, setContract] = useState(null);

  const stanja = ["Created", "Funded", "Completed", "InDispute", "Resolved"];

  // Povezivanje sa MetaMaskom
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        const escrowContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          escrowAbi,
          signer,
        );
        setContract(escrowContract);

        // citanje trenutnog stanja iz ugovora
        const txDetails = await escrowContract.transaction();

        const stanjeIndeks =
          txDetails.currentState !== undefined
            ? Number(txDetails.currentState)
            : Number(txDetails[4]);
        setCurrentState(stanja[stanjeIndeks]);
      } catch (error) {
        console.error("Greška pri povezivanju novčanika:", error);
        alert("Došlo je do greške prilikom povezivanja sa MetaMask-om.");
      }
    } else {
      alert("Molimo instalirajte MetaMask!");
    }
  };

  // Funkcija za oslobadjanje sredstava (Kupac)
  const releaseFunds = async () => {
    try {
      const tx = await contract.releaseFunds();
      await tx.wait();
      alert("Sredstva su uspešno oslobođena prodavcu!");
      connectWallet();
    } catch (err) {
      alert("Greška: " + (err.reason || err.message));
    }
  };

  // Funkcija za pokretanje spora (Kupac/Prodavac)
  const raiseDispute = async () => {
    try {
      const tx = await contract.raiseDispute();
      await tx.wait();
      alert("Spor je uspešno pokrenut!");
      connectWallet();
    } catch (err) {
      alert("Greška: " + (err.reason || err.message));
    }
  };

  // Funkcija za arbitra da resi spor
  const resolveDispute = async (pobednikAdresa) => {
    try {
      const tx = await contract.resolveDispute(pobednikAdresa);
      await tx.wait();
      alert("Spor je uspešno rešen i ugovor je zatvoren!");
      connectWallet();
    } catch (err) {
      alert("Greška: " + (err.reason || err.message));
    }
  };

  const trenutniKorisnik = account.toLowerCase();

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>Escrow dApp sa Arbitražom</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Poveži MetaMask novčanik
        </button>
      ) : (
        <div>
          <p>
            <strong>Tvoja adresa:</strong>{" "}
            <code style={{ background: "#eee", padding: "2px 6px" }}>
              {account}
            </code>
          </p>
          <p>
            <strong>Trenutno stanje ugovora:</strong>{" "}
            <span style={{ color: "blue", fontWeight: "bold" }}>
              {currentState}
            </span>
          </p>

          <hr style={{ margin: "20px 0" }} />

          {/* 1: fonded - ceka se isplata ili spor */}
          {currentState === "Funded" && (
            <div
              style={{ display: "flex", gap: "20px", justifyContent: "center" }}
            >
              {trenutniKorisnik === ADRESA_KUPCA && (
                <button
                  onClick={releaseFunds}
                  style={{
                    background: "green",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Potvrdi prijem i isplati prodavca (Kupac)
                </button>
              )}

              {(trenutniKorisnik === ADRESA_KUPCA ||
                trenutniKorisnik === ADRESA_PRODAVCA) && (
                <button
                  onClick={raiseDispute}
                  style={{
                    background: "orange",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Pokreni spor
                </button>
              )}

              {trenutniKorisnik === ADRESA_ARBITRA && (
                <p style={{ color: "#666", fontStyle: "italic" }}>
                  Vi ste ulogovani kao Arbitar. Ugovor je trenutno osiguran
                  parama, čeka se potvrda kupca.
                </p>
              )}
            </div>
          )}

          {/* 2: spor - in dispute */}
          {currentState === "InDispute" && (
            <div style={{ justifyContent: "center" }}>
              {trenutniKorisnik === ADRESA_ARBITRA ? (
                <div
                  style={{
                    border: "2px dashed red",
                    padding: "20px",
                    borderRadius: "8px",
                    display: "inline-block",
                  }}
                >
                  <h3>Sekcija za Arbitražu ⚖️</h3>
                  <p>
                    Ugovor je suspendovan. Kao izabrani arbitar, donesite odluku
                    o podeli sredstava:
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      justify: "center",
                    }}
                  >
                    <button
                      onClick={() => resolveDispute(ADRESA_KUPCA)}
                      style={{
                        background: "blue",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Presudi u korist Kupca (Vrati novac)
                    </button>
                    <button
                      onClick={() => resolveDispute(ADRESA_PRODAVCA)}
                      style={{
                        background: "purple",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Presudi u korist Prodavca (Isplati sve)
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  Pokrenut je spor! Sredstva su zamrznuta dok Arbitar ne donese
                  odluku.
                </p>
              )}
            </div>
          )}

          {/* 3: krajnji status (COMPLETED ili RESOLVED) */}
          {(currentState === "Completed" || currentState === "Resolved") && (
            <div
              style={{
                background: "#d4edda",
                color: "#155724",
                padding: "15px",
                borderRadius: "5px",
                display: "inline-block",
                marginTop: "10px",
              }}
            >
              <strong>Ugovor je zatvoren!</strong> Sredstva su uspešno
              raspoređena sa ugovora i transakcija je završena.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
