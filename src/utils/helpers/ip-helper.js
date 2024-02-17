export default (req) => {
    if (req.headers === null) return req.connection.remoteAddress;
    if (req.headers['x-forwarded-for']) return req.headers['x-forwarded-for'].split(/, /)[0];
    return req.connection.remoteAddress;
};