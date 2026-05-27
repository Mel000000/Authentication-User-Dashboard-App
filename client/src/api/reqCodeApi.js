import apiClient from "./apiClient";


export const sendMail = async (email, mode = "reset") => {
    const res = await apiClient.post(`/codeRequest`, { email, mode });
    const data = await res.text() || res.json(); 
    if (!res.ok) {
      const err = new Error(data);
      err.response = { status: res.status, data };
      throw err;
    }
    return data;
};

export const verifyCode = async (email, userCode, mode = "reset") => {
  const res = await apiClient.post(`/codeRequest/verifyCode`, { email, userCode, mode });
  const data = await res.text() || res.json(); 
  if (!res.ok) {
    const err = new Error(data);
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
};


export const resetPassword = async (email, newPassword, resetToken) => {
    const res = await apiClient.post(`/codeRequest/resetPassword/?token=${resetToken}`, { email, newPassword });
    const data = await res.text() || res.json(); 
    if (!res.ok) {
      const err = new Error(data);
      err.response = { status: res.status, data };
      throw err;
    }
    return data;
};