export default async (req, res) => {
  return res.render("auth/login.ejs", { message: null, data: null });
};