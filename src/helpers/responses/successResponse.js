module.exports = (res, status, data, message) => {
    res.status(status).json({
        status: "success",
        message,
        data,
    });
};
  