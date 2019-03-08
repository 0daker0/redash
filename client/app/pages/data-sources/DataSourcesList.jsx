import React from 'react';
import Button from 'antd/lib/button';
import { react2angular } from 'react2angular';
import { isEmpty, get } from 'lodash';
import settingsMenu from '@/services/settingsMenu';
import { DataSource } from '@/services/data-source';
import { policy } from '@/services/policy';
import navigateTo from '@/services/navigateTo';
import { $route } from '@/services/ng';
import { routesToAngularRoutes } from '@/lib/utils';
import CardsList from '@/components/cards-list/CardsList';
import LoadingState from '@/components/items-list/components/LoadingState';
import CreateSourceDialog from '@/components/CreateSourceDialog';
import helper from '@/components/dynamic-form/dynamicFormHelper';

class DataSourcesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dataSourceTypes: [], dataSources: [], loading: true };
  }

  componentDidMount() {
    Promise.all([
      DataSource.query().$promise,
      DataSource.types().$promise,
    ]).then(values => this.setState({
      dataSources: values[0],
      dataSourceTypes: values[1],
      loading: false,
    }, () => { // all resources are loaded in state
      if ($route.current.locals.isNewDataSourcePage) {
        this.showCreateSourceDialog();
      }
    }));
  }

  createDataSource = (selectedType, values) => {
    const target = { options: {}, type: selectedType };
    helper.updateTargetWithValues(target, values);

    return DataSource.save(target).$promise.then(() => {
      this.setState({ loading: true });
      DataSource.query(dataSources => this.setState({ dataSources, loading: false }));
    }).catch((error) => {
      if (!(error instanceof Error)) {
        error = new Error(get(error, 'data.message', 'Failed saving.'));
      }
      return Promise.reject(error);
    });
  };

  showCreateSourceDialog = () => {
    CreateSourceDialog.showModal({
      types: this.state.dataSourceTypes,
      sourceType: 'Data Source',
      imageFolder: DataSource.IMG_ROOT,
      helpTriggerPrefix: 'DS_',
      onCreate: this.createDataSource,
    }).result.then((success) => {
      if (success) {
        this.setState({ loading: true });
        DataSource.query(dataSources => this.setState({ dataSources }));
      }
    }).finally(() => {
      if ($route.current.locals.isNewDataSourcePage) {
        navigateTo('data_sources');
      }
    });
  };

  renderDataSources() {
    const { dataSources } = this.state;
    const items = dataSources.map(dataSource => ({
      title: dataSource.name,
      imgSrc: `${DataSource.IMG_ROOT}/${dataSource.type}.png`,
      href: `data_sources/${dataSource.id}`,
    }));

    return isEmpty(dataSources) ? (
      <div className="text-center">
        There are no data sources yet.
        <div className="m-t-5">
          <a className="clickable" onClick={this.showCreateSourceDialog}>Click here</a> to add one.
        </div>
      </div>
    ) : (<CardsList items={items} />);
  }

  render() {
    const newDataSourceProps = {
      type: 'primary',
      onClick: policy.isCreateDataSourceEnabled() ? this.showCreateSourceDialog : null,
      disabled: !policy.isCreateDataSourceEnabled(),
    };

    return (
      <div>
        <div className="m-b-15">
          <Button {...newDataSourceProps}>
            <i className="fa fa-plus m-r-5" />
            New Data Source
          </Button>
        </div>
        {this.state.loading ? <LoadingState className="" /> : this.renderDataSources()}
      </div>
    );
  }
}

export default function init(ngModule) {
  settingsMenu.add({
    permission: 'admin',
    title: 'Data Sources',
    path: 'data_sources',
    order: 1,
  });

  ngModule.component('pageDataSourcesList', react2angular(DataSourcesList));

  return routesToAngularRoutes([
    {
      path: '/data_sources',
      title: 'Data Sources',
      key: 'data_sources',
    },
    {
      path: '/data_sources/new',
      title: 'Data Sources',
      key: 'data_sources',
      isNewDataSourcePage: true,
    },
  ], {
    template: '<settings-screen><page-data-sources-list></page-data-sources-list></settings-screen>',
    controller($scope, $exceptionHandler) {
      'ngInject';

      $scope.handleError = $exceptionHandler;
    },
  });
}

init.init = true;
