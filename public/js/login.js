/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el); //move to one element above then remove the child.
};
// type is 'success' or 'error'
const showAlert = (type, msg) => {
  hideAlert(); //1st hide all the alerts that already exist
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup); //inside the body but at the beginning.
  window.setTimeout(hideAlert, 5000); //also hide all the alerts after 5 seconds.
};



//export const login = async (email, password) => {
  const login = async (email, password) => {
  try {
    const res = await axios({  //axious returns a promise
      method: 'POST',
      url: '/api/v1/users/login', 
      data: {
        email: email,
        password: password
      }
    });

    if (res.data.status === 'success') {
      console.log(res);
      showAlert('success', 'Logged in successfully!'); //shows the alert then reload the front page.
      window.setTimeout(() => {
        location.assign('/'); //go to home page
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

//export const logout = async () => {
const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true); //reload the page , that we are loggedout and user menu
    //will disappear, true means reload from server and not from browser cache
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};


const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout); //call the logout function





























//   const login = async (email, password) => {
//       try {
//         const res = await axios({  //axious returns a promise
//           method: 'POST',
//           url: 'http://127.0.0.1:5000/api/v1/users/login', 
//           data: {
//             email: email,
//             password: password
//           }
//         });
//         if (res.data.status === 'success') {
//           showAlert('success', 'Logged in successfully!'); //shows the alert then reload the front page.
//           window.setTimeout(() => {
//             location.assign('/'); //go to h ome page
//           }, 1500);
//         }
//       } catch (err) {
//         showAlert('error', err.response.data.message);
//       }
//     };


// const loginForm = document.querySelector('.form').addEventListener('submit', e => {
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email,password);
// });