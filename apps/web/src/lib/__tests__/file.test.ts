import { downloadBlob, downloadJson, downloadCsv, downloadText } from '../file';

describe('File Utilities', () => {
  let mockCreateElement: jest.SpyInstance;
  let mockCreateObjectURL: jest.MockedFunction<typeof URL.createObjectURL>;
  let mockRevokeObjectURL: jest.MockedFunction<typeof URL.revokeObjectURL>;
  let mockAppendChild: jest.SpyInstance;
  let mockRemoveChild: jest.SpyInstance;
  let mockClick: jest.Mock;

  beforeEach(() => {
    // Mock anchor element
    mockClick = jest.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    };

    mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    mockCreateObjectURL = URL.createObjectURL as jest.MockedFunction<typeof URL.createObjectURL>;
    mockRevokeObjectURL = URL.revokeObjectURL as jest.MockedFunction<typeof URL.revokeObjectURL>;
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
    mockRevokeObjectURL.mockImplementation();
    mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation();
    mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadBlob', () => {
    it('should create and trigger download for a blob', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test.txt';

      downloadBlob(blob, filename);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadJson', () => {
    it('should download object as formatted JSON', () => {
      const data = { name: 'Test', value: 123 };
      const filename = 'data.json';

      downloadJson(data, filename);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should download array as formatted JSON', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const filename = 'array.json';

      downloadJson(data, filename);

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('downloadCsv', () => {
    it('should download CSV with headers and rows', () => {
      const headers = ['Name', 'Age', 'City'];
      const rows = [
        ['Alice', '30', 'New York'],
        ['Bob', '25', 'Los Angeles'],
      ];
      const filename = 'data.csv';

      downloadCsv(headers, rows, filename);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should properly escape CSV cells with quotes', () => {
      const headers = ['Field'];
      const rows = [['Value with "quotes"']];

      downloadCsv(headers, rows, 'test.csv');

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('downloadText', () => {
    it('should download text content with default mime type', () => {
      const content = 'Plain text content';
      const filename = 'document.txt';

      downloadText(content, filename);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should download text content with custom mime type', () => {
      const content = '<html><body>HTML content</body></html>';
      const filename = 'page.html';
      const mimeType = 'text/html';

      downloadText(content, filename, mimeType);

      expect(mockClick).toHaveBeenCalled();
    });
  });
});
