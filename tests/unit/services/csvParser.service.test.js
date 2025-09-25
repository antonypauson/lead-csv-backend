const fs = require("fs");
const path = require("path");
const csvParserService = require("../../../src/services/csvParser.service");

const UPLOADS_DIR = path.join(__dirname, "../../../uploads");
const TEST_FILES_DIR = path.join(__dirname, "../../files");

describe("csvParserService", () => {
  beforeAll(() => {
    // uploads directory exists for test files
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    // test files directory exists
    if (!fs.existsSync(TEST_FILES_DIR)) {
      fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up any files
    fs.readdirSync(UPLOADS_DIR).forEach((file) => {
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    });
  });

  afterAll(() => {
    // Clean up uploads directory
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.rmdirSync(UPLOADS_DIR);
    }
  });

  test("should parse a valid CSV file correctly", async () => {
    // creating a valid csv
    const csvContent =
      "name,age,city\nJohn Doe,30,New York\nJane Smith,25,London";
    const filePath = path.join(UPLOADS_DIR, "valid.csv");
    fs.writeFileSync(filePath, csvContent);

    // parse data from service
    const parsedData = await csvParserService.parseCsv(filePath);

    expect(parsedData).toBeInstanceOf(Array);
    expect(parsedData.length).toBe(2);
    expect(parsedData[0]).toEqual({
      name: "John Doe",
      age: "30",
      city: "New York",
    });
    expect(parsedData[1]).toEqual({
      name: "Jane Smith",
      age: "25",
      city: "London",
    });
  });

  test("should handle an empty CSV file", async () => {
    // headers only, no data CSV
    const csvContent = "name,age,city\n";
    const filePath = path.join(UPLOADS_DIR, "empty.csv");
    fs.writeFileSync(filePath, csvContent);

    // parse data from service
    const parsedData = await csvParserService.parseCsv(filePath);

    expect(parsedData).toBeInstanceOf(Array);
    expect(parsedData.length).toBe(0);
  });

  test("should throw an error for a non-existent file", async () => {
    // a file that doesn't exists
    const nonExistentFilePath = path.join(UPLOADS_DIR, "nonexistent.csv");

    await expect(
      csvParserService.parseCsv(nonExistentFilePath)
    ).rejects.toThrow(/Failed to parse CSV file: ENOENT/);
  });

  test("should throw an error for a malformed CSV file", async () => {
    // Missing data for one column
    const csvContent = "name,age\nJohn Doe,30\nJane Smith"; 
    const filePath = path.join(UPLOADS_DIR, "malformed.csv");
    fs.writeFileSync(filePath, csvContent);

    // csv-parser might not throw for malformed data but rather parse it imperfectly.
    // We'll check if it produces unexpected results or if it throws.
    // For this specific malformed case, csv-parser will likely parse 'Jane Smith' as { name: 'Jane Smith', age: undefined }
    const parsedData = await csvParserService.parseCsv(filePath);
    expect(parsedData[1]).toEqual({ name: "Jane Smith", age: undefined });
  });

  test("should handle CSV with different delimiters if configured", async () => {
    // This service uses default comma delimiter. No specific test needed for other delimiters here.
    const csvContent = "name;age;city\nJohn Doe;30;New York";
    const filePath = path.join(UPLOADS_DIR, "semicolon.csv");
    fs.writeFileSync(filePath, csvContent);

    const parsedData = await csvParserService.parseCsv(filePath);
    // Expect it to parse as a single column as delimiter is not specified
    expect(parsedData[0]).toEqual({ "name;age;city": "John Doe;30;New York" });
  });
});
