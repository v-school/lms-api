const express = require("express");

const {
    QuestionModel,
    MultChoiceQuestionModel,
    TextQuestionModel
} = require("../../../models/api/coursework-material/questions.js");

const questionRouter = express.Router({ mergeParams: true });


questionRouter.route("/")
    .get((req, res) => {
        const { courseMatId } = req.params;
        QuestionModel.find({ ...req.query, courseMaterial: courseMatId }, (err, qs) => {
            if (err) return res.status(500).send(err);
            res.status(200).send(qs);
        });
    })
    .post((req, res) => {
        const { courseMatId } = req.params;
        const { type } = req.query;
        if (req.user.permissions && req.user.permissions.admin) {
            let newQ;
            const body = { courseMaterial: courseMatId, ...req.body };
            switch (type) {
                case "mult":
                    newQ = new MultChoiceQuestionModel(body);
                    break
                case "text":
                    newQ = new TextQuestionModel(body);
                    break;
                default:
                    return res.status(403).send({ message: "Query 'type' must be provided" })
            }
            newQ.save((err, savedQ) => {
                if (err) return res.status(500).send(err);
                res.status(201).send(savedQ);
            })
        } else {
            res.status(403).send({ message: "Admin authorization required" });
        }
    })
    .delete((req, res) => {
        const { courseMatId } = req.params;
        if (req.user.permissions && req.user.permissions.admin) {
            QuestionModel.deleteMany({ ...req.query, courseMaterial: courseMatId }, (err) => {
                if (err) return res.status(500).send(err);
                res.status(204).send();
            })
        } else {
            res.status(403).send({ message: "Admin authorization required" });
        }
    })

questionRouter.route("/:qId")
    .get((req, res) => {
        const { courseMatId, qId } = req.params;
        QuestionModel.findOne({ _id: qId, courseMaterial: courseMatId }, (err, q) => {
            if (err) return res.status(500).send(err);
            if (!q) return res.status(404).send({ message: "Question not found" })
            res.status(200).send(q);
        });
    })
    .delete((req, res) => {
        const { courseMatId, qId } = req.params;
        if (req.user.permissions && req.user.permissions.admin) {
            QuestionModel.deleteOne({ _id: qId, courseMaterial: courseMatId }, (err) => {
                if (err) return res.status(500).send(err);
                if (!q) return res.status(404).send({ message: "Question not found" });
                res.status(204).send();
            })
        } else {
            res.status(403).send({ message: "Admin authorization required" });
        }
    })
    .put((req, res) => {
        const { courseMatId, qId } = req.params;
        if (req.user.permissions && req.user.permissions.admin) {
            QuestionModel.findOneAndUpdate({ _id: qId, courseMaterial: courseMatId }, req.body, { new: true }, (err, q) => {
                if (err) return res.status(500).send(err);
                if (!q) return res.status(404).send({ message: "Question not found" });
                res.status(200).send(q);
            })
        } else {
            res.status(403).send({ message: "Admin authorization required" });
        }
    });

module.exports = questionRouter;