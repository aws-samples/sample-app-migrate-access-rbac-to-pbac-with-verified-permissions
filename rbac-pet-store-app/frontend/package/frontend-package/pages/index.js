import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import StoreSelector from "../components/StoreSelector";

export default function HomePage() {
  const { data: session } = useSession();
  const [header1, setHeader1] = useState("API Status");
  const [header2, setHeader2] = useState("");
  const [apiResponse1, setApiResponse1] = useState("");
  const [apiResponse2, setApiResponse2] = useState("");
  const [formattedApiResponse2, setFormattedApiResponse2] = useState("");
  const [isAccordionOpen1, setIsAccordionOpen1] = useState(false);
  const [isAccordionOpen2, setIsAccordionOpen2] = useState(false);
  const [isAccordionOpen3, setIsAccordionOpen3] = useState(false);
  const [petId, setPetId] = useState("");
  const [petType, setPetType] = useState("");
  const [petPrice, setPetPrice] = useState("");
  const [petName, setPetName] = useState("");
  const [storeId, setStoreId] = useState("1");

  useEffect(() => {
    if (session) {
      if (
        header1 == "API Status" ||
        apiResponse1 == "User logged in, API ready to execute."
      ) {
        setApiResponse1(
          `<span class="${styles.green}">User logged in, API ready to execute.</span><br/><br/><span class="${styles.value}">You can now make API calls to manage pets.</span>`
        );
      }
    } else {
      setApiResponse1(
        `<span class="${styles.value}">Login before attempting to access the API.</span>`
      );
    }
  }, [session]);

  const handleViewDecodedAccessToken = () => {
    if (session) {
      setIsAccordionOpen1(false);
      setIsAccordionOpen2(false);
      setIsAccordionOpen3(false);
      setFormattedApiResponse2("");
      setHeader1("Decoded Access Token");
      setApiResponse1(prettyPrintJson(session.decodedAccessToken));
      setHeader2("Raw Access Token");
      setApiResponse2(session.accessToken);
    } else {
      setIsAccordionOpen1(false);
      setIsAccordionOpen2(false);
      setIsAccordionOpen3(false);
      setFormattedApiResponse2("");
      setHeader1("Decoded Access Token");
      setApiResponse1(
        `<span class="${styles.value}">Login before attempting to access the API.</span>`
      );
      setHeader2("");
    }
  };

  const handleViewDecodedIdToken = () => {
    if (session) {
      setIsAccordionOpen1(false);
      setIsAccordionOpen2(false);
      setIsAccordionOpen3(false);
      setFormattedApiResponse2("");
      setHeader1("Decoded ID Token");
      setApiResponse1(prettyPrintJson(session.decodedIdToken));
      setHeader2("Raw ID Token");
      setApiResponse2(session.idToken);
    } else {
      setIsAccordionOpen1(false);
      setIsAccordionOpen2(false);
      setIsAccordionOpen3(false);
      setFormattedApiResponse2("");
      setHeader1("Decoded ID Token");
      setApiResponse1(
        `<span class="${styles.value}">Login before attempting to access the API.</span>`
      );
      setHeader2("");
    }
  };
  
  const handleViewAccessToken = () => {
    if (session) {
      setToken(session.accessToken);
    }
  };

  const handleViewIdToken = () => {
    if (session) {
      setToken(session.idToken);
    }
  };

  const router = useRouter();
  const handleLogout = () => {
    router.push("/logout");
  };

  const callPetsApi = async () => {
    try {
      var currIdToken = "no-token";
      
      if (session) {
        currIdToken = session.idToken;
      }
      setIsAccordionOpen1(false);
      setIsAccordionOpen2(false);
      setIsAccordionOpen3(false);
      
      // Fetch the pets API endpoint from the backend function
      const endpointResponse = await fetch(`/api/getPetsApiEndpoint`);
      const endpointData = await endpointResponse.json();
      var listPetsApiEndpoint = endpointData.endpoint;
      
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">curl -X GET ${listPetsApiEndpoint} \\\\<br> -H 'Authorization: Bearer ${currIdToken}'\\\\<br> -H 'Content-Type: application/json' | jq</span></div>`
      );
      setHeader2("API Response");
      setApiResponse2("");
      setFormattedApiResponse2("Loading...");

      const response = await fetch(listPetsApiEndpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${currIdToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setFormattedApiResponse2(prettyPrintJson(data));
    } catch (error) {
      console.log(error);
      setFormattedApiResponse2("Error: Not Authorized");
      setFormattedApiResponse2(prettyPrintJson({ Message: "Access Denied" }));
    }
  };

  const getSinglePetDetails = async (petId) => {
    try {
      var currIdToken = "no-token";
      if (session) {
        currIdToken = session.idToken;
      }
      const endpointResponse = await fetch(`/api/getPetsApiEndpoint`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const endpointData = await endpointResponse.json();
      var getPetApiEndpoint = endpointData.endpoint+"/"+petId;
      
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">curl -X GET ${getPetApiEndpoint} \\\\<br> -H 'Authorization: Bearer ${currIdToken}'\\\\<br> -H 'Content-Type: application/json' | jq</span></div>`
      );
      setHeader2("API Response");
      setApiResponse2("");
      setFormattedApiResponse2("Loading...");

      const response = await fetch(getPetApiEndpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${currIdToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setFormattedApiResponse2(prettyPrintJson(data));
    } catch (error) {
      setFormattedApiResponse2("Error: Not Authorized");
      setFormattedApiResponse2(prettyPrintJson({ Message: "Access Denied" }));
    }
  };

  const createNewPet = async (petId, petType, petPrice, petName) => {
    try {
      var currIdToken = "no-token";
      if (session) {
        currIdToken = session.idToken;
      }
      const endpointResponse = await fetch(`/api/getPetsApiEndpoint`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const endpointData = await endpointResponse.json();
      
      const createPetEndpoint = endpointData.endpoint;

      setHeader1("Calling POST /pets");
      setFormattedApiResponse2("Loading...");
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">curl -X POST ${createPetEndpoint} -d '{\"id\": ${petId}, \"type\": \"${petType}\", \"price\": \"${petPrice}\", \"name\": \"${petName}\"}' \\\\<br> -H 'Authorization: Bearer ${currIdToken}'\\\\<br> -H 'Content-Type: application/json' | jq</span></div>`
      );
      const response = await fetch(createPetEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currIdToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(petId),
          type: petType,
          price: petPrice,
          name: petName
        }),
      });
      const data = await response.json();
      setFormattedApiResponse2(prettyPrintJson(data));
    } catch (error) {
      setFormattedApiResponse2("Error: Not Authorized");
      setFormattedApiResponse2(prettyPrintJson({ Message: "Access Denied" }));
    }
  };

  const deletePetById = async (petId) => {
    try {
      var currIdToken = "no-token";
      if (session) {
        currIdToken = session.idToken;
      }
      const endpointResponse = await fetch(`/api/getPetsApiEndpoint`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const endpointData = await endpointResponse.json();
      const deletePetApiEndpoint = endpointData.endpoint + "/" + petId;

      setHeader1("Calling DELETE /pets/{id}");
      setFormattedApiResponse2("Loading...");
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">curl -X DELETE ${deletePetApiEndpoint} \\\\<br> -H 'Authorization: Bearer ${currIdToken}'\\\\<br> -H 'Content-Type: application/json' | jq</span></div>`
      );
      const response = await fetch(deletePetApiEndpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currIdToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setFormattedApiResponse2(prettyPrintJson(data));
    } catch (error) {
      setFormattedApiResponse2("Error: Not Authorized");
      setFormattedApiResponse2(prettyPrintJson({ Message: "Access Denied" }));
    }
  };

  const handleOpenGetPetsById = () => {
    setIsAccordionOpen1(!isAccordionOpen1);
    if (!isAccordionOpen1) {
      setIsAccordionOpen2(false);
      setIsAccordionOpen3(false);
      setHeader1("GET Pets by ID");
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">To get a pet by ID, enter the Pet ID in the form and click 'Submit'.<br> This will make a GET request to the /pets/{id} endpoint.</span></div>`
      );
      setHeader2("API Response");
      setApiResponse2(" ");
      setFormattedApiResponse2("Waiting for input...");
    }
  };

  const handleOpenPostPetsById = () => {
    setIsAccordionOpen2(!isAccordionOpen2);
    setIsAccordionOpen1(false);
    setIsAccordionOpen3(false);
    if (!isAccordionOpen2) {
      setHeader1("Create New Pet");
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">To create a new pet, fill in the details and click 'Submit'. <br /> Example:<br />   Pet ID: 4<br />   Pet Type: lizard <br />   Pet Price: 25 <br />   Pet Name: Rex <br /><br />This will make a POST request to the /pets endpoint.</span></div>`
      );
      setHeader2("API Response");
      setApiResponse2(" ");
      setFormattedApiResponse2("Waiting for input...");
    }
  };

  const handleOpenDeletePetsById = () => {
    setIsAccordionOpen3(!isAccordionOpen3);
    setIsAccordionOpen2(false);
    setIsAccordionOpen1(false);
    if (!isAccordionOpen3) {
      setHeader1("DELETE Pet by ID");
      setApiResponse1(
        `<div class="${styles.sourceCodeContainer}"><span class="${styles.sourceCode}">To delete a pet by ID, enter the Pet ID in the form and click 'Submit'.<br /> This will make a DELETE request to the /pets/{id} endpoint.</span></div>`
      );
      setHeader2("API Response");
      setApiResponse2(" ");
      setFormattedApiResponse2("Waiting for input...");
    }
  };

  const handleGetSinglePet = (event) => {
    event.preventDefault();
    getSinglePetDetails(petId);
  };

  const handleNewPetSubmit = (event) => {
    event.preventDefault();
    createNewPet(petId, petType, petPrice, petName);
  };

  const handleDeletePetSubmit = (event) => {
    event.preventDefault();
    deletePetById(petId);
  };

  const prettyPrintJson = (json) => {
    if (typeof json !== "string") {
      json = JSON.stringify(json, null, 2);
    }
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\")(\\s*:\\s*)(.*)/g,
        function (match, p1, p2, p3, p4) {
          return `<span class="${styles.key}">${p1}</span>${p3}<span class="${styles.value}">${p4}</span>`;
        }
      );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headertitle1}>Wyld Pets Store - with RBAC</div>
        {session ? (
          <>
            <div className={styles.signedInText}>
              <p>
                Signed in as: <b>{session.user.name}</b>
              </p>
              <img src="/thumbprint.png" alt="Passkey" height="50" />
            </div>
            <button onClick={handleLogout} className={styles.loginButton}>
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("cognito")}
            className={styles.loginButton}
          >
            Sign in with Cognito
          </button>
        )}
      </header>
      <main className={styles.main}>
        <div className={styles.leftColumn}>
          <div className={styles.buttonContainer}>
            <h3>
              <b>Token Actions</b>
            </h3>
            <button
              onClick={handleViewDecodedAccessToken}
              className={styles.button}
            >
              View Access Token
            </button>
            <button
              onClick={handleViewDecodedIdToken}
              className={styles.button}
            >
              View ID Token
            </button>
          </div>
          
          <div className={styles.buttonContainer}>
            <h3>
              <b>API Actions</b>
            </h3>
            <div className={styles.accordionContainer}>
              <b>List</b> Pets 
              <br />
              <button onClick={callPetsApi} className={styles.button}>
                Call <b>GET</b> /pets
              </button>
              <br />
              <br />
            </div>

            <div className={styles.accordionContainer}>
              <b>GET</b> Pets by ID
              <br />
              <button onClick={handleOpenGetPetsById} className={styles.button}>
                {isAccordionOpen1 ? "Close" : "Open"} <b>GET</b> /pets/{"{id}"}{" "}
              </button>
              <br />
              <br />
              {isAccordionOpen1 && (
                <form onSubmit={handleGetSinglePet} className={styles.form}>
                  <div className={styles.formRow}>
                    <label htmlFor="petId">Pet ID:</label>
                    <input
                      type="number"
                      id="petId"
                      value={petId}
                      onChange={(e) => setPetId(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.accordionButton}>
                    Submit
                  </button>
                </form>
              )}
            </div>
            <div className={styles.accordionContainer}>
              <b>POST</b> Create New Pet
              <br />
              <button
                onClick={handleOpenPostPetsById}
                className={styles.button}
              >
                {isAccordionOpen2 ? "Close" : "Open"} <b>POST</b> /pets Form
              </button>
              <br />
              <br />
              {isAccordionOpen2 && (
                <form onSubmit={handleNewPetSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <label htmlFor="createPetId">Pet ID:</label>
                    <input
                      type="number"
                      id="createPetId"
                      value={petId}
                      onChange={(e) => setPetId(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="petType">Pet Type:</label>
                    <input
                      type="text"
                      id="petType"
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="petPrice">Pet Price:</label>
                    <input
                      type="text"
                      id="petPrice"
                      value={petPrice}
                      onChange={(e) => setPetPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="petName">Pet Name:</label>
                    <input
                      type="text"
                      id="petName"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.accordionButton}>
                    Submit
                  </button>
                </form>
              )}
            </div>
            <div className={styles.accordionContainer}>
              <b>DELETE</b> Pet by ID
              <br />
              <button
                onClick={handleOpenDeletePetsById}
                className={styles.button}
              >
                {isAccordionOpen3 ? "Close" : "Open"} <b>DELETE</b> /pets/{"{id}"} Form
              </button>
              <br />
              <br />
              {isAccordionOpen3 && (
                <form onSubmit={handleDeletePetSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <label htmlFor="deletePetId">Pet ID:</label>
                    <input
                      type="text"
                      id="deletePetId"
                      value={petId}
                      onChange={(e) => setPetId(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.accordionButton}>
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <p>
            <b>{header1}</b>
          </p>
          <pre dangerouslySetInnerHTML={{ __html: apiResponse1 }}></pre>
          <br />
          <p>
            <b>{header2}</b>
          </p>
          <pre
            dangerouslySetInnerHTML={{ __html: formattedApiResponse2 }}
          ></pre>
          {apiResponse2}
        </div>
      </main>
      <footer className={styles.footer}>
        <p>AWS - Wyld Pets Store Demo for re:Inforce 2025 - All Rights Reserved 2025</p>
      </footer>
    </div>
  );
}