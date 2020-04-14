import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalWindow from '../lib/ModalWindow';

import * as actions from './actions';
import PageChooserHeader from './PageChooserHeader';
import PageChooserSpinner from './PageChooserSpinner';
import ModelChooserSearchView from './views/ModelChooserSearchView';
import PageChooserErrorView from './views/PageChooserErrorView';
import ModelChooserBrowseView from './views/ModelChooserBrowseView';

const propTypes = {
  modelPath: PropTypes.any,
  browse: PropTypes.func.isRequired
};

const defaultProps = {
  modelPath: null
};

class ModelChooser extends ModalWindow {
  componentDidMount() {
    const { browse, modelPath } = this.props;
    browse(modelPath);
  }

  renderModalContents() {
    const {
      browse,
      error,
      isFetching,
      items,
      onPageChosen,
      parent,
      search,
      totalItems,
      viewName,
      viewOptions
    } = this.props;

    // Event handlers
    const onSearch = queryString => {
      if (queryString) {
        search(queryString);
      } else {
        // Search box is empty, browse instead
        browse('');
      }
    };

    const onNavigate = page => {
      browse(page.label, 1);
    };

    const onChangePage = newPageNumber => {
      // Used for pagination
      switch (viewName) {
        case 'browse':
          browse(viewOptions.parentPageID, newPageNumber);
          break;
        case 'search':
          search(viewOptions.queryString, newPageNumber); // TODO NOTE I removed the middle param
          break;
        default:
          break;
      }
    };

    // Views
    let view = null;
    switch (viewName) {
      case 'browse':
        view = (
          <ModelChooserBrowseView
            parentPage={parent}
            items={items}
            // pageNumber={viewOptions.pageNumber}
            onPageChosen={onPageChosen}
            onNavigate={onNavigate}
            onChangePage={onChangePage}
          />
        );
        break;
      case 'search':
        view = (
          <ModelChooserSearchView
            items={items}
            totalItems={totalItems}
            // pageNumber={viewOptions.pageNumber}
            onPageChosen={onPageChosen}
            onNavigate={onNavigate}
            onChangePage={onChangePage}
          />
        );
        break;
      default:
        break;
    }

    // Check for error
    if (error) {
      view = <PageChooserErrorView errorMessage={error} />;
    }

    return (
      <div>
        <PageChooserHeader onSearch={onSearch} searchEnabled={!error} searchTitle="Choose a model" />
        <PageChooserSpinner isActive={isFetching}>{view}</PageChooserSpinner>
      </div>
    );
  }
}

ModelChooser.propTypes = propTypes;
ModelChooser.defaultProps = defaultProps;

const mapStateToProps = state => ({
  viewName: state.viewName,
  viewOptions: state.viewOptions,
  parent: state.parent,
  totalItems: state.totalItems,
  items: state.items,
  isFetching: state.isFetching,
  error: state.error
});

const mapDispatchToProps = dispatch => ({
  browse: (parentPageID, pageNumber) =>
    dispatch(actions.browseModels(parentPageID, pageNumber)),
  search: (queryString) =>
    dispatch(actions.searchModels(queryString))
});

export default connect(mapStateToProps, mapDispatchToProps)(ModelChooser);