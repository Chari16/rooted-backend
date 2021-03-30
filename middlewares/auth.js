const { getTokenFromRequest, verifyToken, serializeUser } = require('../utils/authorization')

/*
middleware to extract token from header

Header Format:
Autorization Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1wSWQiOiJFTVAwMDQiLCJpYXQiOjE2MTcxMjU4NTEsImV4cCI6MTYxNzIxMjI1MX0.mgUCMgqoGScKIyFRH6zO1NBNtadHyl4XqfUbNaVHw90
*/
const auth = async(req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        const decoded = await verifyToken(token);
        if(decoded.id) {
            req.user = serializeUser(decoded)
        }
        next()
    } 
    catch(e){
        res.status(401).send({ error:'Unauthorized' })
    }
}

module.exports = auth;