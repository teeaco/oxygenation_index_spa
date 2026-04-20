import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

interface Crumb {
  label: string;
  path?: string;
}

interface BreadCrumbsProps {
  crumbs: Crumb[];
}

export const BreadCrumbs = ({ crumbs }: BreadCrumbsProps) => {
  return (
    <ul className='breadcrumbs'>
      <li>
        <Link to={ROUTES.HOME}>Главная</Link>
      </li>
      {crumbs.map((crumb, index) => (
        <Fragment key={`${crumb.label}-${index}`}>
          <li className='slash'>/</li>
          {index === crumbs.length - 1 ? (
            <li>{crumb.label}</li>
          ) : (
            <li>
              <Link to={crumb.path ?? ROUTES.HOME}>{crumb.label}</Link>
            </li>
          )}
        </Fragment>
      ))}
    </ul>
  );
};
