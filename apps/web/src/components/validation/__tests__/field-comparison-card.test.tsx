import React from 'react';
import { render, screen } from '@testing-library/react';
import { FieldComparisonCard } from '../field-comparison-card';

describe('FieldComparisonCard', () => {
  const defaultProps = {
    index: 0,
    fieldName: 'Brand Name',
    expectedValue: 'Approved Brand',
    actualValue: 'Different Brand',
  };

  it('should render the field name and index', () => {
    render(<FieldComparisonCard {...defaultProps} />);

    expect(screen.getByText('1')).toBeInTheDocument(); // index + 1
    expect(screen.getByText('Brand Name')).toBeInTheDocument();
  });

  it('should display expected and actual values', () => {
    render(<FieldComparisonCard {...defaultProps} />);

    expect(screen.getByText('Approved Brand')).toBeInTheDocument();
    expect(screen.getByText('Different Brand')).toBeInTheDocument();
  });

  it('should use default labels when not provided', () => {
    render(<FieldComparisonCard {...defaultProps} />);

    expect(screen.getByText('Approved Application')).toBeInTheDocument();
    expect(screen.getByText('Your Label')).toBeInTheDocument();
  });

  it('should use custom labels when provided', () => {
    render(
      <FieldComparisonCard
        {...defaultProps}
        expectedLabel="Expected Value"
        actualLabel="Found Value"
      />
    );

    expect(screen.getByText('Expected Value')).toBeInTheDocument();
    expect(screen.getByText('Found Value')).toBeInTheDocument();
  });

  it('should display empty text for expected value when value is empty', () => {
    render(
      <FieldComparisonCard
        {...defaultProps}
        expectedValue=""
        expectedEmptyText="No value specified"
      />
    );

    expect(screen.getByText('No value specified')).toBeInTheDocument();
  });

  it('should display empty text for actual value when value is empty', () => {
    render(
      <FieldComparisonCard
        {...defaultProps}
        actualValue=""
        actualEmptyText="Value not found"
      />
    );

    expect(screen.getByText('Value not found')).toBeInTheDocument();
  });

  it('should display custom action text when provided', () => {
    const customAction = 'Please update this field immediately';
    render(<FieldComparisonCard {...defaultProps} actionText={customAction} />);

    expect(screen.getByText(customAction)).toBeInTheDocument();
  });

  it('should display default action text when not provided', () => {
    render(<FieldComparisonCard {...defaultProps} />);

    expect(
      screen.getByText('Update your label to match the approved application value')
    ).toBeInTheDocument();
  });

  it('should display the warning message', () => {
    render(<FieldComparisonCard {...defaultProps} />);

    expect(
      screen.getByText("The information on your label doesn't match the approved application")
    ).toBeInTheDocument();
  });

  it('should render with correct index for multiple cards', () => {
    const { rerender } = render(<FieldComparisonCard {...defaultProps} index={0} />);
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<FieldComparisonCard {...defaultProps} index={5} />);
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should handle special characters in field values', () => {
    render(
      <FieldComparisonCard
        {...defaultProps}
        expectedValue='Value with "quotes" and <tags>'
        actualValue="Value with & special chars"
      />
    );

    expect(screen.getByText('Value with "quotes" and <tags>')).toBeInTheDocument();
    expect(screen.getByText('Value with & special chars')).toBeInTheDocument();
  });
});
