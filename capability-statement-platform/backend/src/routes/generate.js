import express from "express"
import { generateDocument } from "../services/docGenerator.js"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const filePath = await generateDocument(req.body)

    res.download(filePath)

  } catch (err) {
    console.error(err)
    res.status(500).send("Generation failed")
  }
})

export default router
