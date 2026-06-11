import apiClient from "./apiClient";


export const sendMail = async (email, mode = "reset") => {
  try{
    const res = await apiClient.post(`/codeRequest`, { email, mode });
    return res.data;
  }
  catch(err){
    if (err.response) {
      const { status, data } = err.response;
      const error = new Error(data);
      error.response = { status, data };
      throw error;
    }
  }
};

export const verifyCode = async (email, userCode, mode = "reset") => {
  try {
    const res = await apiClient.post(`/codeRequest/verifyCode`, { email, userCode, mode });
    return res.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const error = new Error(data);
      error.response = { status, data };
      throw error;
    }
  }
};


export const resetPassword = async (email, newPassword) => {
  try {
    const res = await apiClient.post(`/codeRequest/resetPassword`, { email, newPassword});
    return res.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const error = new Error(data);
      error.response = { status, data };
      throw error;
    }
  }
};