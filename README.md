# `firestore-jest-mock` Typescript Demo

A TypeScript project to demonstrate how to consume typings from [`firestore-jest-mock`](https://github.com/Upstatement/firestore-jest-mock).

This package contains the necessary boilerplate for a Node.js project written in the strictest TypeScript and ESLint rules. The package doesn't actually do anything (and doesn't even include build scripts), as this package exists only to test a testing utility.

## How to Use

### Prerequisites

This project requires [NodeJS](https://nodejs.org/) and [NPM](https://npmjs.org/).
To make sure you have them available on your machine,
try running the following command:

```sh
$ npm -v && node -v
6.14.11
v14.6.0
```

### Clone the Repo

```sh
$ cd path/to/parent
$ git clone https://github.com/AverageHelper/firestore-jest-mock-typescript-shim-3-test.git
$ cd firestore-jest-mock-typescript-shim-3-test
```

### Install Dependencies

Obviously.

```sh
$ npm install
```

### Run Lint

These lint rules are very strict. There should be no use of `any` here; that is, ESLint should be able to properly consume all types from `firestore-jest-mock`.

```sh
$ npm run lint
```

### Run Tests

These tests are TypeScript ports of some of `firestore-jest-mock`'s own tests. If these pass, then all should be well at runtime.

```sh
$ npm run test
```
