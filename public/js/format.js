const vietnamMoneyFormat = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(number);
};

const kilometerFormat = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "unit",
    unit: "kilometer",
  });
  return formatter.format(number);
};

export { vietnamMoneyFormat, kilometerFormat };
