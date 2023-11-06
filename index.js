(function () {
    // Load the Tableau Extensions API
    tableau.extensions.initializeAsync({ 'configure': showConfigurationDialog }).then(() => {
        console.log('Extension initialized.');
        initializeExtension();

    });

    // Function to show the configuration dialog
    function showConfigurationDialog() {
        const popupUrl = 'dialog.html';
        tableau.extensions.ui.displayDialogAsync(popupUrl, null, { width: 300, height: 300 }).then((closePayload) => {
            console.log('Dialog closed', closePayload);
            initializeExtension();
        }).catch((error) => {
            switch (error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    console.log('Dialog closed by user');
                    break;
                default:
                    console.error(error.message);
            }
        });
    }

    // Function to update the parameter
    function updateParameter(selectedCount) {
        const settings = tableau.extensions.settings.getAll();
        const parameterName = settings.parameterName;

        if (parameterName) {
            tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((parameters) => {
                const parameter = parameters.find(param => param.name === parameterName);
                if (parameter) {
                    // Resolve the promise before updating the parameter
                    parameter.changeValueAsync(selectedCount);
                } else {
                    console.error('Parameter not found');
                }
            });
        } else {
            console.error('Parameter name not set in settings');
        }
    }

    // Event listener for filter changes
    async function filterChangedHandler(filterEvent) {
        const settings = tableau.extensions.settings.getAll();
        const filterName = settings.filterName;

        if (filterName) {
            filterEvent.getFilterAsync().then(async filter => {
                const selectedCount = await getAppliedValuesOrCount(filter);
                updateParameter(selectedCount);
            });
        } else {
            console.error('Filter name not set in settings');
        }
    }

    // Get Filter applied values and update parameter
    function getFilterAppliedValuesAndSetParameter() {
        const settings = tableau.extensions.settings.getAll();
        const worksheetName = settings.worksheetName;
        const filterName = settings.filterName;

        if (worksheetName && filterName) {
            const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(sheet => sheet.name === worksheetName);
            if (worksheet) {
                worksheet.getFiltersAsync().then(async filters => {
                    const filter = filters.find(filter => filter.fieldName === filterName);
                    if (filter) {
                        const selectedCount = await getAppliedValuesOrCount(filter);
                        updateParameter(selectedCount);
                    } else {
                        console.error('Filter not found');
                    }
                });
            } else {
                console.error('Worksheet not found');
            }
        } else {
            console.error('Worksheet or filter name not set in settings');
        }
    }

    // Get applied values or count if all is selected
    async function getAppliedValuesOrCount(filter) {
        if (filter.isAllSelected) {
            // Get domain length if all is selected
            try {
                const domain = await filter.getDomainAsync();
                const allValuesCount = await domain.values.length;
                console.log('Applied values', allValuesCount);
                return allValuesCount;
            } catch (error) {
                // Handle any errors that may occur during the async operation
                console.error('Error getting domain:', error);
                throw error; // re-throw the error to be handled by the caller
            }
        } else {
            console.log('Applied values', filter.appliedValues.length);
            return filter.appliedValues.length;
        }
    }


    // Utility function to register filter event listener
    function registerFilterEventListener() {
        const settings = tableau.extensions.settings.getAll();
        const worksheetName = settings.worksheetName;
        const filterName = settings.filterName;

        if (worksheetName && filterName) {
            const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(sheet => sheet.name === worksheetName);
            if (worksheet) {
                getFilterAppliedValuesAndSetParameter();
                worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
            } else {
                console.error('Worksheet not found');
            }
        } else {
            console.error('Worksheet or filter name not set in settings');
        }
    }

    // Initialize the extension function
    function initializeExtension() {
        const settings = tableau.extensions.settings.getAll();
        // If the settings are not configured, show the configuration dialog
        if (settings.worksheetName && settings.filterName && settings.parameterName) {
            console.log('Settings found', settings);
            registerFilterEventListener();
        } else {
            console.log('Settings not found', settings);
            showConfigurationDialog();
        }
    }
})();
