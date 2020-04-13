/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';


const hideAlert1 = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el); //move to one element above then remove the child.
};
// type is 'success' or 'error'
const showAlert1 = (type, msg) => {
  hideAlert1(); //1st hide all the alerts that already exist
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup); //inside the body but at the beginning.
  window.setTimeout(hideAlert1, 5000); //also hide all the alerts after 5 seconds.
};


// type is either 'password' or 'data' , we are updating either data(name,email) of a user or a password.
//export const updateSettings = async (data, type) => {
const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert1('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert1('error', err.response.data.message);
  }
};



const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });


if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    //After api call is successful then delete the content from the input fields.
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });