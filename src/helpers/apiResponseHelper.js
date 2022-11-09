const successResponse = (data, errorList) => {
  return {
    status: "success",
    code: 200,
    data,
    errorMessages: errorList,
  };
};

const errorResponse = (data, errorList) => {
  return {
    status: "failed",
    code: 400,
    data: [],
    errorMessages: errorList,
  };
};

module.exports = { successResponse, errorResponse };
