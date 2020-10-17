const sanitize = require("mongo-sanitize");

const Entries = require("../models").Entries;

function importMultiline(req, res) {
  const dataset = req.body.data.split("\n");

  if (!dataset) {
    res.json({ code: 400, msg: "Data empty." });
  } else {
    let coll = [];
    for (let i = 0; i < dataset.length; i++) {
      if (!dataset[i]) {
        continue;
      }
      const temp = dataset[i].split(":");

      let entry = {};
      let nowTime = Date.now();

      entry.title = sanitize(temp[0]);
      entry.content = sanitize(temp[1]);
      entry.belongs = sanitize(req.session.userId);
      entry.createdTime = nowTime;
      entry.nextReviewTime = nowTime + 3600 * 1000 * 24;
      entry.reviewTimesCount = 0;

      coll.push(entry);
    }

    Entries.insertMany(coll, function(err, result) {
      res.json({ code: 200, msg: "" });
    });
  }
}

function getAll(req, res) {
  const userId = req.session.userId;

  Entries.find({ belongs: userId }, function(err, docs) {
    docs.sort(function(a, b) {
      return a.createdTime - b.createdTime;
    });

    res.json({ code: 200, data: docs });
  });
}

function getAllNeedRemembered(req, res) {
  const userId = req.session.userId;
  const nowTime = Date.now();

  Entries.find(
    {
      $and: [{ belongs: userId }, { nextReviewTime: { $lte: nowTime } }]
    },
    function(err, docs) {
      docs.sort(function(a, b) {
        return a.nextReviewTime - b.nextReviewTime;
      });

      res.json({ code: 200, data: docs });
    }
  );
}

function search(req, res) {
  const userId = req.session.userId;
  const keyword = sanitize(req.body.keyword);

  Entries.find(
    {
      $and: [
        { belongs: userId },
        {
          $or: [
            { title: { $regex: keyword } },
            { content: { $regex: keyword } }
          ]
        }
      ]
    },
    function(err, docs) {
      res.json({ code: 200, data: docs });
    }
  );
}

function batchDel(req, res) {
  const userId = req.session.userId;
  const ids = req.body.ids;
  let coll = [];

  ids.forEach(id => coll.push(sanitize(id)));

  Entries.deleteMany(
    {
      $and: [
        { belongs: userId },
        {
          _id: {
            $in: coll
          }
        }
      ]
    },
    function(err, docs) {
      res.json({ code: 200 });
    }
  );
}

function markEntries(req, res) {
  const data = req.body.data;

  if (!data) {
    res.json({ code: 400, msg: "Data empty." });
  } else {
    data.forEach(el => {
      Entries.findOne({ _id: el._id, belongs: req.session.userId }, function(
        err,
        docs
      ) {
        if (docs != null) {
          let update = {};
          update.reviewTimesCount = docs.reviewTimesCount + 1;
          if (el.isRemembered === 0) {
            update.nextReviewTime = Date.now() + 3600 * 1000 * 24;
          } else {
            if (docs.reviewTimesCount === 0) {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24;
            } else if (docs.reviewTimesCount === 1) {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24 * 3;
            } else if (docs.reviewTimesCount === 2) {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24 * 3;
            } else if (docs.reviewTimesCount === 3) {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24 * 7;
            } else if (docs.reviewTimesCount === 4) {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24 * 14;
            } else if (docs.reviewTimesCount === 5) {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24 * 30;
            } else {
              update.nextReviewTime = Date.now() + 3600 * 1000 * 24 * 60;
            }
          }

          Entries.findOneAndUpdate(
            { _id: el._id, belongs: req.session.userId },
            update
          );
        }
      });
    });

    res.json({ code: 200 });
  }
}

module.exports = {
  importMultiline: importMultiline,
  getAllNeedRemembered: getAllNeedRemembered,
  getAll: getAll,
  search: search,
  batchDel: batchDel,
  markEntries: markEntries
};
