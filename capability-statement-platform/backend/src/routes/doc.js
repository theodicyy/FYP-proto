import express from "express"
import docGenerator from "../services/docGenerator.js"

const router = express.Router()

router.post("/generate", (req, res) => {
  const html = docGenerator.generate(req.body)
  res.send(html)
})

export default router
