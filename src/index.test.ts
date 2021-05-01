/* eslint-disable @typescript-eslint/unbound-method */
// Ignoring unbound-method; lots of these tests check that certain methods exist as functions on returned values.

import type Firebase from "firebase";
import { mockFirebase } from "firestore-jest-mock";
import { mockInitializeApp } from "firestore-jest-mock/mocks/firebase";
import {
  mockGet,
  mockAdd,
  mockSet,
  mockUpdate,
  mockWhere,
  mockCollectionGroup,
  mockBatch,
  mockBatchCommit,
  mockBatchDelete,
  mockBatchUpdate,
  mockBatchSet,
  mockSettings,
  mockOnSnapShot,
  mockUseEmulator,
  mockDoc,
  mockCollection,
  mockWithConverter,
  FakeFirestore
} from "firestore-jest-mock/mocks/firestore";

const flushPromises = (): Promise<void> => new Promise<void>(setImmediate);

describe("we can start a firebase application", () => {
  let firebase: typeof Firebase;

  interface StoredUser {
    id: string;
    first: string;
    last: string;
    born: number;
  }

  mockFirebase({
    database: {
      users: [
        { id: "abc123", first: "Bob", last: "builder", born: 1998 },
        {
          id: "123abc",
          first: "Blues",
          last: "builder",
          born: 1996,
          _collections: {
            cities: [{ id: "LA", name: "Los Angeles", state: "CA", country: "USA", visited: true }]
          }
        }
      ],
      cities: [
        { id: "LA", name: "Los Angeles", state: "CA", country: "USA" },
        { id: "DC", name: "Disctric of Columbia", state: "DC", country: "USA" }
      ]
    }
  });

  beforeEach(async () => {
    firebase = (await import("firebase")).default;
    firebase.initializeApp({
      apiKey: "### FIREBASE API KEY ###",
      authDomain: "### FIREBASE AUTH DOMAIN ###",
      projectId: "### CLOUD FIRESTORE PROJECT ID ###"
    });
  });

  test("We can start an application", () => {
    const db = firebase.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    expect(mockInitializeApp).toHaveBeenCalled();
    expect(mockSettings).toHaveBeenCalledWith({ ignoreUndefinedProperties: true });
  });

  test("we can use emulator", () => {
    const db = firebase.firestore();
    db.useEmulator("localhost", 9000);
    expect(mockUseEmulator).toHaveBeenCalledWith("localhost", 9000);
  });

  describe("Examples from documentation", () => {
    test("add a user", async () => {
      const db = firebase.firestore();

      // Example from documentation:
      // https://firebase.google.com/docs/firestore/quickstart#add_data

      const docRef = await db //
        .collection("users")
        .add({
          first: "Ada",
          last: "Lovelace",
          born: 1815
        });
      expect(mockAdd).toHaveBeenCalled();
      expect(docRef).toHaveProperty("id", "abc123");
    });

    test("get all users", async () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/quickstart#read_data

      const querySnapshot = await db //
        .collection("users")
        .get();
      expect(querySnapshot.forEach).toBeFunction();
      expect(querySnapshot.docs.length).toBe(2);
      expect(querySnapshot.size).toBe(querySnapshot.docs.length);
      querySnapshot.forEach(doc => {
        expect(doc.exists).toBe(true);
        expect(doc.data()).toBeTruthy();
        expect((doc.data() as StoredUser).id).toBeFalsy();
      });
    });

    test("collectionGroup at root", async () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query

      const querySnapshot = await db //
        .collectionGroup("users")
        .where("last", "==", "builder")
        .get();
      expect(mockCollectionGroup).toHaveBeenCalledWith("users");
      expect(mockGet).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("last", "==", "builder");
      expect(querySnapshot.forEach).toBeFunction();
      expect(querySnapshot.docs.length).toBe(2);
      expect(querySnapshot.size).toBe(querySnapshot.docs.length);
      querySnapshot.forEach(doc => {
        expect(doc.exists).toBe(true);
        expect(doc.data()).toBeTruthy();
      });
    });

    test("collectionGroup with subcollections", async () => {
      const querySnapshot = await firebase //
        .firestore()
        .collectionGroup("cities")
        .where("type", "==", "museum")
        .get();
      expect(mockCollectionGroup).toHaveBeenCalledWith("cities");
      expect(mockGet).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("type", "==", "museum");
      expect(querySnapshot.forEach).toBeFunction();
      expect(querySnapshot.docs.length).toBe(3);
      expect(querySnapshot.size).toBe(querySnapshot.docs.length);
      querySnapshot.forEach(doc => {
        expect(doc.exists).toBe(true);
        expect(doc.data()).toBeTruthy();
      });
    });

    test("set a city", async () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document\

      await db //
        .collection("cities")
        .doc("LA")
        .set({
          name: "Los Angeles",
          state: "CA",
          country: "USA"
        });
      expect(mockSet).toHaveBeenCalledWith({
        name: "Los Angeles",
        state: "CA",
        country: "USA"
      });
    });

    test("updating a city", async () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
      const washingtonRef = db.collection("cities").doc("DC");

      // Set the "capital" field of the city 'DC'
      await washingtonRef //
        .update({
          capital: true
        });
      expect(mockUpdate).toHaveBeenCalledWith({ capital: true });
    });

    test("batch writes", async () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://cloud.google.com/firestore/docs/manage-data/transactions

      // Get a new write batch
      const batch = db.batch();

      // Set the value of 'NYC'
      const nycRef = db.collection("cities").doc("NYC");
      batch.set(nycRef, { name: "New York City" });

      // Update the population of 'SF'
      const sfRef = db.collection("cities").doc("SF");
      batch.update(sfRef, { population: 1000000 });

      // Delete the city 'LA'
      const laRef = db.collection("cities").doc("LA");
      batch.delete(laRef);

      // Commit the batch
      const result = await batch.commit();
      expect(result).toBeArray();
      expect(mockBatch).toHaveBeenCalled();
      expect(mockBatchDelete).toHaveBeenCalledWith(laRef);
      expect(mockBatchUpdate).toHaveBeenCalledWith(sfRef, { population: 1000000 });
      expect(mockBatchSet).toHaveBeenCalledWith(nycRef, { name: "New York City" });
      expect(mockBatchCommit).toHaveBeenCalled();
    });

    test("onSnapshot single doc", async () => {
      const db = firebase.firestore();

      // Example from documentation:
      // https://firebase.google.com/docs/firestore/query-data/listen

      db.collection("cities")
        .doc("LA")
        .onSnapshot(doc => {
          expect(doc).toHaveProperty("data");
          expect(doc.data).toBeFunction();
          expect(doc).toHaveProperty("metadata");
        });

      await flushPromises();

      expect(mockOnSnapShot).toHaveBeenCalled();
    });

    test("onSnapshot can work with options", async () => {
      const db = firebase.firestore();

      // Example from documentation:
      // https://firebase.google.com/docs/firestore/query-data/listen

      db.collection("cities")
        .doc("LA")
        .onSnapshot(
          {
            // Listen for document metadata changes
            includeMetadataChanges: true
          },
          doc => {
            expect(doc).toHaveProperty("data");
            expect(doc.data).toBeFunction();
            expect(doc).toHaveProperty("metadata");
          }
        );

      await flushPromises();

      expect(mockOnSnapShot).toHaveBeenCalled();
    });

    test("onSnapshot with query", async () => {
      const db = firebase.firestore();

      // Example from documentation:
      // https://firebase.google.com/docs/firestore/query-data/listen

      const unsubscribe = db
        .collection("cities")
        .where("state", "==", "CA")
        .onSnapshot(querySnapshot => {
          expect(querySnapshot).toHaveProperty("forEach");
          expect(querySnapshot).toHaveProperty("docChanges");
          expect(querySnapshot).toHaveProperty("docs");

          expect(querySnapshot.forEach).toBeFunction();
          expect(querySnapshot.docChanges).toBeFunction();
          expect(querySnapshot.docs).toBeArray();

          expect(querySnapshot.docChanges()).toBeArray();
        });

      await flushPromises();

      expect(unsubscribe).toBeFunction();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOnSnapShot).toHaveBeenCalled();
    });

    describe("withConverter", () => {
      const converter: Firebase.firestore.FirestoreDataConverter<unknown> = {
        fromFirestore: () => undefined,
        toFirestore: () => ({})
      };

      test("single document", async () => {
        const db = firebase.firestore();

        const recordDoc = db.doc("cities/la").withConverter(converter);

        expect(mockDoc).toHaveBeenCalledWith("cities/la");
        expect(mockWithConverter).toHaveBeenCalledWith(converter);
        expect(recordDoc).toBeInstanceOf(FakeFirestore.DocumentReference);

        const record = await recordDoc.get();
        expect(mockGet).toHaveBeenCalled();
        expect(record).toHaveProperty("id", "la");
        expect(record.data).toBeFunction();
      });

      test("single undefined document", async () => {
        const db = firebase.firestore();

        const recordDoc = db.collection("cities").withConverter(converter).doc();

        expect(mockCollection).toHaveBeenCalledWith("cities");
        expect(mockWithConverter).toHaveBeenCalledWith(converter);
        expect(mockDoc).toHaveBeenCalledWith("abc123");
        expect(recordDoc).toBeInstanceOf(FakeFirestore.DocumentReference);

        const record = await recordDoc.get();
        expect(mockGet).toHaveBeenCalled();
        expect(record).toHaveProperty("id", "abc123");
        expect(record.data).toBeFunction();
      });

      test("multiple documents", async () => {
        const db = firebase.firestore();

        const recordsCol = db.collection("cities").withConverter(converter);

        expect(mockCollection).toHaveBeenCalledWith("cities");
        expect(mockWithConverter).toHaveBeenCalledWith(converter);
        expect(recordsCol).toBeInstanceOf(FakeFirestore.CollectionReference);

        const records = await recordsCol.get();
        expect(mockGet).toHaveBeenCalled();
        expect(records).toHaveProperty("docs", expect.any(Array));
      });
    });
  });
});
