module.exports = () => {
  const ISODate = new Date(Date.now());

  return ISODate.toISOString();
};
