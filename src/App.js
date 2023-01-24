import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, createContext, useContext } from "react";
import React from "react";
import { Routes, useParams } from "react-router";
import {Route, useNavigate, Link, BrowserRouter } from "react-router-dom";
import { Button, Col, Container, Form, Row, Navbar, Nav, Spinner, DropdownButton,Dropdown, Table } from 'react-bootstrap';
import {Bar} from 'react-chartjs-2';
const userContext = createContext(null);
const loginContext = createContext(null);
function App() {
  const [token, settoken] = useState('');
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState("fail");
  return (
    <loginContext.Provider value = {{loginState:loginState,setLoginState:setLoginState}}>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          {loginState === "fail" ? <Navbar.Brand href="/">URL shortener App</Navbar.Brand>:""}
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="nav-links">{
              loginState === "fail" ? <>
              <Link to="/Forgot" className="nav-link">Forgot password</Link>
              <Link to="/Login" className="nav-link">Login</Link>
              <Link to="/SignUp" className="nav-link">Sign up</Link></>
              : 
              <>
              <Link to="/urlDashboard" className="nav-link">URL Dashboard</Link>
              <Link to="/urlShortener" className="nav-link">URL shortener</Link>
              <Link to="/urlTable" className="nav-link">URL table</Link></>
            }  </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <userContext.Provider value={{
        token: token, settoken: settoken,
        email: email, setEmail: setEmail
      }}>
        <Routers />
      </userContext.Provider>
    </loginContext.Provider>
  );
}
function Routers() {
  const {loginState} = useContext(loginContext);
  return (
    <>
      <Routes>
        <Route path="/SignUp" element={<SignUp />}/>
        <Route path="/Login" element={<Login />}/>
        <Route path="/Forgot" element={<Forgot />}/>
        <Route path="/retrieveAccount/:email/:token" element={<OpenedEmail />}/>
        <Route path="/activateAccount/:email/:token" element={ <ActivateAccount />}/>
     {loginState==="success" ? 
     <>   <Route path="/urlDashboard" element={<UrlDashboard />}/>
   <Route path="/urlShortener" element={<UrlShortener />}/>
   <Route path="/urlTable" element={<UrlTable />}/>
   </>:""}
   <Route path="/:short" element={<RedirectToLong />}/>
        <Route path="*" element={<Home />}/>
        </Routes>
    </>
  )
}
function Home() {
  return (
    <Container className="container">
      <div className="home-header">Welcome!</div>
      <div className="home-content">Login to see the dashboard, create short URL, list of created URLs</div>
    </Container>
  )
}
function Forgot() {
  const { email, setEmail } = useContext(userContext);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    if (email) {
      setMessage('waiting');
      sendEmail();
    } else {
      setError('please enter the email')
    }
  }
  function sendEmail() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/users/forgot", {
      method: "POST",
      body: JSON.stringify({ email: email }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message))
  };
  return (
    <Container className="container" >
      {message ? (message === 'waiting' ? <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner> : message)
        : (
          <Row>
            <Col xs='auto' sm='7' md='6' lg='4' >
              <Form onSubmit={handleSubmit} >
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" onChange={(event) => setEmail(event.target.value)} />
                  <div className="error">
                    {error}
                  </div>
                </Form.Group>
                <Button variant="primary" type="submit"  >
                  Submit
                </Button><br />
              </Form>
            </Col>
          </Row>)
      }


    </Container>
  )
}
function OpenedEmail() {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (password) {
      setMessage("waiting");
      updatePassword();
    } else {
      setError("please enter the password")
    }

  }
  const [error, setError] = useState('');
  const [message, setMessage] = useState('waiting');
  const { email, token } = useParams();
  const [password, setPassword] = useState('');
  function getMessage() {
    fetch(`https://urlshortener-backend-r4rr.onrender.com/retrieveAccount/${email}/${token}`, {
      method: "GET",
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message));
  }
  function updatePassword() {
    fetch(`https://urlshortener-backend-r4rr.onrender.com/resetPassword/${email}/${token}`, {
      method: "PUT",
      body: JSON.stringify({ newPassword: password }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message))
  };

  useEffect(() => {
    getMessage();
    // eslint-disable-next-line
  }, []);
  return (
    <Container className="container" >
      {message === 'waiting' ? <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner> : (message === "retrieve account" ?

        <Row>
          <Col xs='auto' sm='7' md='6' lg='4' >
            <Form onSubmit={handleSubmit} >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" onChange={(event) => setPassword(event.target.value)} />
              </Form.Group>
              <div className="error">
                {error}
              </div>
              <Button variant="primary" type="submit"  >
                Submit
              </Button><br />
            </Form>
          </Col>
        </Row>
        : message
      )
      }
    </Container>
  )
}

function SignUp() {
  const history = useNavigate();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      setError('please enter the required(*) fields');
    } else if (message === "This email is available") {
      setMessage("waiting")
      createAccount();
    }
  }
  function checkEmail() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/data", {
      method: "POST",
      body: JSON.stringify({ email: email }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message));
  };
  useEffect(() => {
    checkEmail();
    // eslint-disable-next-line
  }, [email]);
  function createAccount() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/users/SignUp", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password, firstName: firstName, lastName: lastName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message));
  };

  return (
    <Container className="container">
      <Row>

        {message === "waiting" ?
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          :

          (message !== "This email is not available. Try another" && message !== "This email is available"
            && message ? message :
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col xs='9' sm='7' md='5' lg='4' >
                  <Form.Group className="mb-3" >
                    <Form.Label><span className="error">*</span>First Name</Form.Label>
                    <Form.Control type="text" placeholder="First Name" onChange={(event) => setFirstName(event.target.value)} />
                  </Form.Group></Col>

                <Col xs='9' sm='7' md='5' lg='4' >
                  <Form.Group className="mb-3" >
                    <Form.Label><span className="error">*</span>Last Name</Form.Label>
                    <Form.Control type="text" placeholder="Last Name" onChange={(event) => setLastName(event.target.value)} />
                  </Form.Group></Col></Row>

              <Row><Col xs='9' sm='7' md='5' lg='4'>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label><span className="error">*</span>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" onChange={(event) => setEmail(event.target.value)} />
                  <div className="error">{message === "This email is not available. Try another" ? message : ""}</div>
                  <Form.Text className="text-muted"> We'll never share your email with anyone else.</Form.Text>
                </Form.Group></Col>

                <Col xs='9' sm='7' md='5' lg='4'>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>
                      <span className="error">*</span>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
                  </Form.Group></Col></Row>
              <p className="error">
                {error}
              </p>
              <Row>
                <Col md='5' >
                  <Button variant="primary" type="submit">
                    Sign Up
                  </Button></Col>
                <Col md='5' >
                  <Form.Text className="text">Have an account?</Form.Text>
                  <Button variant="success" type="submit" onClick={() => history.push("/Login")}>Log in</Button></Col>
              </Row>
            </Form>
          )
        }




      </Row>
    </Container>
  )
}
function ActivateAccount() {
  const { email, token } = useParams();
  const [message, setMessage] = useState('waiting');
  function getMessage() {
    fetch(`https://urlshortener-backend-r4rr.onrender.com/activateAccount/${email}/${token}`, {
      method: "PUT",
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message));
  }
  useEffect(() => {
    getMessage();
    // eslint-disable-next-line
  }, []);
  return (
    <Container className="container" >
      {message === 'waiting' ? <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner> : (message === "activate account" ?
        "Sign up success. Click 'Login' to use the account"
        : message
      )
      }
    </Container>
  )
}
function Login() {
  const { setLoginState} = useContext(loginContext);
  const history = useNavigate();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    if (email && password) {
      setMessage("waiting");
      loginAccount();
    }
    else {
      setError("Please enter the required(*) fields")
    }
  }
  function loginAccount() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/users/Login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((userdata) => setMessage(userdata.message));
  };

  return (
    <Container className="container">
      <Row>
        <Col xs='auto' sm='7' md='6' lg='4'>
          {message === "waiting" ?
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            :
            (message ? message :
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>
                    <span className="error">*</span>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" onChange={(event) => setEmail(event.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>
                    <span className="error">*</span>Password</Form.Label>
                  <Form.Control type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
                </Form.Group>
                <p className="error">
                  {error}
                </p>
                <Button variant="success" type="submit">
                  Login
                </Button><br />
                <Link to="/Forgot" className="link">
                  Forgot password?
                </Link><br />
                <Button variant="primary" className="centre-button" onClick={() => history.push('/SignUp')}>
                  Create account
                </Button>
              </Form>
            )
          }
        </Col>
      </Row>
      {message==="successful login!!!" ? setLoginState("success"):""}
    </Container>
  )
}
function UrlDashboard() {
  const months = ["", "Jan", "Feb", "Mar", "Apr","May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov","Dec"];
  const [graph, setGraph] = useState('monthly');
  const [urlsData, setUrlsData] = useState([]);
  function monthlyData() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/urlGraph/monthly", {
      method: "GET",
    })
      .then((data) => data.json())
      .then((urldata) => setUrlsData(urldata))
  }
  function dailyData(month) {
    fetch(`https://urlshortener-backend-r4rr.onrender.com/urlGraph/daily/${month}`, {
      method: "GET",
    })
      .then((data) => data.json())
      .then((urldata) => setUrlsData(urldata))
  }
  useEffect(() => {
    monthlyData();
  }, []);
  const state = {
    labels: 
    graph === "monthly" ? urlsData.map((urlData)=>months[Number(urlData.date)]) : urlsData.map((urlData)=>urlData.date) 
    ,
    datasets: [
      {
        label: 'no of Urls',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 1,
        data: urlsData.map((urlData)=>urlData.noOfUrls)
      }
    ]
  }
    return (
      <div>
         <DropdownButton id="dropdown-basic-button" title="select graph" >
    <Dropdown.Item onClick = {()=>{setGraph("monthly");monthlyData()}}>monthly Data</Dropdown.Item>
    <Dropdown.Item onClick = {()=>{setGraph("daily");dailyData("01")}}>daily Data</Dropdown.Item>
  </DropdownButton><br/>
  {graph==="daily" ? 
  <DropdownButton id="dropdown-basic-button" title="select month" >
  <Dropdown.Item onClick = {()=>dailyData("01")}>January</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("02")}>February</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("03")}>March</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("04")}>April</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("05")}>May</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("06")}>June</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("07")}>July</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("08")}>August</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("09")}>September</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("10")}>October</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("11")}>November</Dropdown.Item>
  <Dropdown.Item onClick = {()=>dailyData("12")}>December</Dropdown.Item>
</DropdownButton>
: ""
}
      <Bar
        data={state}
        options={{
          title:{
            display:true,
            text:'Average Rainfall per month',
            fontSize:20
          },
          legend:{
            display:true,
            position:'right'
          }
        }}
      />
    </div>
    )
}

function UrlShortener() {
  const [fullUrl, setFullUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    if (fullUrl) {
      setMessage('waiting');
      getShortUrl()
    } else {
      setMessage('please enter the Url')
    }
  }
  function getShortUrl() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/shortUrl", {
      method: "POST",
      body: JSON.stringify({ fullUrl: fullUrl }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((urlsData) => {setShortUrl(urlsData.short); setMessage('success')})
  };
  return (
    <Container className="container" >
          <Row>
            <Col  >
              <Form onSubmit={handleSubmit} >
                <Form.Group className="mb-3" >
                  <Form.Label>Enter the URL</Form.Label>
                  <Form.Control type="text" placeholder="Enter the URL" onChange={(event) => setFullUrl(event.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit"  >
                  Submit
                </Button><br />
                {message === "waiting" ? 
                <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      :
      (shortUrl ? <a href = "shortUrl" >{shortUrl}</a> : message)
  }
              </Form>
            </Col>
          </Row>
      


    </Container>
  )
}
function RedirectToLong() {
  const [message, setMessage] = useState('waiting');
  const {short} = useParams();
  function redirect() {
    fetch(`https://urlshortener-backend-r4rr.onrender.com/${short}`, {
      method: "GET",
    })
    .then((data)=> data.json())
    .then((urlData)=>{window.location.href = urlData.full; setMessage('none')});
  }
  useEffect(() => {
    redirect();
    // eslint-disable-next-line
  }, []);
  return(
    <Container className = "container">
   {message === "waiting" ?<>
    <div className="home-content">Please wait until we redirect you to the URL</div>
    <div className="home-header">
    <Spinner animation="grow" variant="primary" />
    <Spinner animation="grow" variant="secondary" />
    <Spinner animation="grow" variant="success" />
    <Spinner animation="grow" variant="danger" />
    </div></>
    : ""}
  </Container>
  )
}
function UrlTable() {
  const [urlsData, setUrlsData] = useState([]);
  const handleClick = (event) => {
    event.preventDefault();
  }
  function getUrlsData() {
    fetch("https://urlshortener-backend-r4rr.onrender.com/urlsData", {
      method: "GET",
    })
      .then((data) => data.json())
      .then((jsonData) => setUrlsData(jsonData));
  }
  useEffect(() => {
    getUrlsData();
  }, []);
  return (
    <div className="container">
      <h1>URL list Table</h1>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>URL created date</th>
            <th>short URL link</th>
            <th>short URL clicks</th>
            <th>long URL link</th>
          </tr>
        </thead>
        <tbody>
          {urlsData.map((urlData) =>
            <tr>
              <td>{urlData.createdAt}</td>
              <td><a href = {urlData.short} target = "_blank" rel="noopener noreferrer">{urlData.short}</a></td>
              <td>{urlData.clicks}</td>
              <td><a href = {urlData.full} target="_blank" rel="noopener noreferrer" onClick = {()=>handleClick}>
                {urlData.full}</a></td>
            </tr>
          )}


        </tbody>
      </Table>
    </div>
  )
}

export default App;