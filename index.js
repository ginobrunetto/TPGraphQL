const express = require("express");
const app = express();
const expressGraphQL = require("express-graphql");
const _ = require("lodash");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require("graphql");

//Require
const Courses = require("./Courses.json");
const Students = require("./Students.json");
const Grades = require("./Grades.json");

//Types
const CourseType = new GraphQLObjectType({
  name: "Course",
  description: "Represent courses",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    students: {
      type: new GraphQLList(StudentType),
      resolve: (course) => {
        return Students.filter((Student) => Student.courseId === course.id);
      },
    },
  }),
});

const StudentType = new GraphQLObjectType({
  name: "Student",
  description: "Represent students",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    lastname: { type: GraphQLNonNull(GraphQLString) },
    courseId: { type: GraphQLNonNull(GraphQLInt) },
    grades: {
      type: new GraphQLList(GradeType),
      resolve: (student) => {
        return Grades.filter((Grade) => Grade.studentId === student.id);
      },
    },
  }),
});

const GradeType = new GraphQLObjectType({
  name: "Grade",
  description: "Represent grades",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    courseId: { type: GraphQLNonNull(GraphQLInt) },
    studentId: { type: GraphQLNonNull(GraphQLInt) },
    grade: { type: GraphQLNonNull(GraphQLInt) },
    student: {
      type: StudentType,
      resolve: (grade) => {
        return Students.find((Student) => Student.id === grade.studentId);
      },
    },
  }),
});

//query
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    Courses: {
      type: new GraphQLList(CourseType),
      description: "List of All Courses",
      resolve: () => Courses,
    },
    Students: {
      type: new GraphQLList(StudentType),
      description: "List of All Students",
      resolve: () => Students,
    },
    Grades: {
      type: new GraphQLList(GradeType),
      description: "List of All Grades",
      resolve: () => Grades,
    },
    Course: {
      type: CourseType,
      description: "Particular Course",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        Courses.find((Course) => Course.id === args.id),
    },
    Student: {
      type: StudentType,
      description: "Particular Student",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        Students.find((Student) => Student.id === args.id),
    },
    Grade: {
      type: GradeType,
      description: "Particular Grade",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => Grades.find((Grade) => Grade.id === args.id),
    },
  }),
});

//mutation
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addCourse: {
      type: CourseType,
      description: "Add a course",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const course = {
          id: Courses.length + 1,
          name: args.name,
          description: args.description,
        };
        Courses.push(course);
        return course;
      },
    },
    addStudent: {
      type: StudentType,
      description: "Add a student",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const student = {
          id: Students.length + 1,
          name: args.name,
          lastname: args.lastname,
          courseId: args.courseId,
        };
        Students.push(student);
        return student;
      },
    },
    addGrade: {
      type: GradeType,
      description: "Add a grade",
      args: {
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        studentId: { type: GraphQLNonNull(GraphQLInt) },
        grade: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const grade = {
          id: Grades.length + 1,
          courseId: args.courseId,
          studentId: args.studentId,
          grade: args.grade,
        };
        Grades.push(grade);
        return grade;
      },
    },
    deleteCourse: {
      type: new GraphQLList(CourseType),
      description: "Delete a Course",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parents, args) => {
        _.remove(Courses, (Course) => Course.id === args.id);
        return Courses;
      },
    },
    deleteStudent: {
      type: new GraphQLList(StudentType),
      description: "Delete a Student",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parents, args) => {
        _.remove(Students, (Student) => Student.id === args.id);
        return Students;
      },
    },
    deleteGrade: {
      type: new GraphQLList(GradeType),
      description: "Delete a Grade",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parents, args) => {
        _.remove(Grades, (Grade) => Grade.id === args.id);
        return Grades;
      },
    },
  }),
});

//schema
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server running");
});