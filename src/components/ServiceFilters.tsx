import { Form } from 'react-bootstrap';

interface ServiceFiltersProps {
  oxygenationIndex: string;
  onOxygenationIndexChange: (value: string) => void;
  onSubmit: () => void;
}

export const ServiceFilters = ({
  oxygenationIndex,
  onOxygenationIndexChange,
  onSubmit,
}: ServiceFiltersProps) => {
  return (
    <section className='search-container'>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className='filters-grid single-filter'>
          <Form.Control
            type='number'
            min='0'
            className='search-input'
            placeholder='Индекс PaO2/FiO2...'
            value={oxygenationIndex}
            onChange={(event) => onOxygenationIndexChange(event.target.value)}
          />
          <button type='submit' className='search-btn'>
            Искать
          </button>
        </div>
      </Form>
    </section>
  );
};
