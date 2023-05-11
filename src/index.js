import { connect, close } from "./connection.js";

const db = await connect();
const usersCollection = db.collection("users");
const articlesCollection = db.collection("articles");
const studentsCollection = db.collection("students");

const run = async () => {
  try {
    // await getUsersExample();
    // await task1();
    // await task2();
    // await task3();
    // await task4();
    // await task5();
    // await task6();
    // await task7();
    await task8();
    // await task9();
    // await task10();
    // await task11();
    // await task12();

    await close();
  } catch (err) {
    console.log("Error: ", err);
  }
};
run();

// #### Users
// - Get users example
async function getUsersExample() {
  try {
    const [allUsers, firstUser] = await Promise.all([
      usersCollection.find().toArray(),
      usersCollection.findOne(),
    ]);

    console.log("allUsers", allUsers);
    console.log("firstUser", firstUser);
  } catch (err) {
    console.error("getUsersExample", err);
  }
}

// - Get all users, sort them by age (ascending), and return only 5 records with firstName, lastName, and age fields.
async function task1() {
  try {
    const result = await usersCollection
      .find(
        {},
        {
          projection: {
            _id: false,
            firstName: true,
            lastName: true,
            age: true,
          },
        }
      )
      .sort({ age: "asc" })
      .limit(5)
      .toArray();
    console.log("Task1: ", result);
  } catch (err) {
    console.error("task1", err);
  }
}

// - Add new field 'skills: []" for all users where age >= 25 && age < 30 or tags includes 'Engineering'
async function task2() {
  try {
    const result = await usersCollection.updateMany(
      {
        $or: [
          { age: { $gte: 25, $lt: 30 } },
          { tags: { $in: ["Engineering"] } },
        ],
      },

      { $set: { skills: [] } }
    );

    console.log("Task2: ", result);
  } catch (err) {
    console.error("task2", err);
  }
}

// - Update the first document and return the updated document in one operation (add 'js' and 'git' to the 'skills' array)
//   Filter: the document should contain the 'skills' field
async function task3() {
  try {
    const result = await usersCollection.findOneAndUpdate(
      { skills: { $exists: true } },
      { $push: { skills: { $each: ["js", "git"] } } }
    );
    console.log("Task3: ", result);
  } catch (err) {
    console.error("task3", err);
  }
}

// - REPLACE the first document where the 'email' field starts with 'john' and the 'address state' is equal to 'CA'
//   Set firstName: "Jason", lastName: "Wood", tags: ['a', 'b', 'c'], department: 'Support'
async function task4() {
  try {
    const result = await usersCollection.replaceOne(
      {
        email: { $regex: /john/ },
      },
      {
        firstName: "Jason",
        lastName: "Wood",
        tags: ["a", "b", "c"],
        department: "Support",
      }
    );
    console.log("Task4: ", result);
  } catch (err) {
    console.log("task4", err);
  }
}

// - Pull tag 'c' from the first document where firstName: "Jason", lastName: "Wood"
async function task5() {
  try {
    const result = await usersCollection.updateOne(
      { firstName: "Jason", lastName: "Wood" },
      { $pull: { tags: "c" } }
    );
    console.log("Task5: ", result);
  } catch (err) {
    console.log("task5", err);
  }
}

// - Push tag 'b' to the first document where firstName: "Jason", lastName: "Wood"
//   ONLY if the 'b' value does not exist in the 'tags'
async function task6() {
  try {
    const result = await usersCollection.updateOne(
      { firstName: "Jason", lastName: "Wood", tags: { $nin: ["b"] } },
      { $push: { tags: "b" } }
    );
    console.log("Task6: ", result);
  } catch (err) {
    console.log("task6", err);
  }
}

// - Delete all users by department (Support)
async function task7() {
  const result = await usersCollection.deleteMany({ department: "Support" });
  console.log("Task7: ", result);
  try {
  } catch (err) {
    console.log("task7", err);
  }
}

// #### Articles
// - Create new collection 'articles'. Using bulk write:
//   Create one article per each type (a, b, c)
//   Find articles with type a, and update tag list with next value ['tag1-a', 'tag2-a', 'tag3']
//   Add tags ['tag2', 'tag3', 'super'] to articles except articles with type 'a'
//   Pull ['tag2', 'tag1-a'] from all articles
async function task8() {
  try {
    const result = await articlesCollection.bulkWrite([
      { insertOne: { document: { type: "a" } } },
      { insertOne: { document: { type: "b" } } },
      { insertOne: { document: { type: "c" } } },
      {
        updateMany: {
          filter: { type: "a" },
          update: { $set: { tag: ["tag1-a", "tag2-a", "tag3"] } },
        },
      },
      {
        updateMany: {
          filter: { type: { $ne: "a" } },
          update: { $push: { tag: { $each: ["tag2", "tag3", "super"] } } },
        },
      },
      {
        updateMany: {
          filter: {},
          update: { $pull: { tag: { $in: ["tag2", "tag1-a"] } } },
        },
      },
    ]);
    console.log("Task8: ", result);
  } catch (err) {
    console.error("task8", err);
  }
}

// - Find all articles that contains tags 'super' or 'tag2-a'
async function task9() {
  try {
    const result = await articlesCollection
      .find({
        $or: [{ tag: { $in: ["super"] } }, { tag: { $in: ["tag2-a"] } }],
      })
      .toArray();
    console.log("Task9: ", result);
  } catch (err) {
    console.log("task9", err);
  }
}

// #### Students Statistic (Aggregations)
// - Find the student who have the worst score for homework, the result should be [ { name: <name>, worst_homework_score: <score> } ]
async function task10() {
  try {
    const result = await studentsCollection
      .aggregate([
        { $unwind: "$scores" },
        { $match: { "scores.type": "homework" } },
        {
          $project: { _id: 0, name: 1, worst_homework_score: "$scores.score" },
        },
        { $sort: { worst_homework_score: 1 } },
        { $limit: 1 },
      ])
      .toArray();

    console.log("Task10: ", result);
  } catch (err) {
    console.log("task10", err);
  }
}

// - Calculate the average score for homework for all students, the result should be [ { avg_score: <number> } ]
async function task11() {
  try {
    const result = await studentsCollection
      .aggregate([
        { $unwind: "$scores" },
        { $match: { "scores.type": "homework" } },
        {
          $group: { _id: "$scores.type", avg_score: { $avg: "$scores.score" } },
        },
        {
          $project: { _id: 0, avg_score: 1 },
        },
      ])
      .toArray();

    console.log("Task11: ", result);
  } catch (err) {
    console.log("task11", err);
  }
}

// - Calculate the average score by all types (homework, exam, quiz) for each student, sort from the largest to the smallest value
async function task12() {
  try {
    const result = await studentsCollection
      .aggregate([
        { $unwind: "$scores" },
        { $match: { "scores.score": { $exists: true } } },
        {
          $group: { _id: "$name", avg_score: { $avg: "$scores.score" } },
        },
        { $project: { _id: 0, name: "$_id", avg_score: 1 } },
        {
          $sort: { avg_score: -1 },
        },
      ])
      .toArray();

    console.log("Task12: ", result);
  } catch (err) {
    console.log("task12", err);
  }
}
