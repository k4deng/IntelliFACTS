export default async (req, res) => {
  return res.render('index.ejs', {
    site: 'Home',
    user: null
  });
};