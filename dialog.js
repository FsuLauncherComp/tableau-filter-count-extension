(function () {
    // Load the Tableau Extensions API
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
        console.log('Dialog opened', openPayload);
        populateDropdowns();
    });
    // Function to populate dropdown menus
    function populateDropdowns() {
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // Populate worksheet dropdown
        const worksheetSelect = $('#worksheet-select');
        const savedWorksheetName = tableau.extensions.settings.get('worksheetName');
        dashboard.worksheets.forEach(worksheet => {
            let isSelected = worksheet.name === savedWorksheetName;
            if (isSelected) {
                console.log('Worksheet selected', worksheet.name);
            }
            worksheetSelect.append(new Option(text = worksheet.name, value = worksheet.name, defaultSelected = isSelected, selected = isSelected));
        });

        // Set event handler for worksheet dropdown
        worksheetSelect.change(() => {
            const selectedWorksheetName = worksheetSelect.val();
            const selectedWorksheet = dashboard.worksheets.find(sheet => sheet.name === selectedWorksheetName);
            populateFilterDropdown(selectedWorksheet);
            populateParameterDropdown();
        });

        // Trigger change event to populate filter and parameter dropdowns based on initial selection
        worksheetSelect.trigger('change');
    }

    // Function to populate filter dropdown based on selected worksheet
    function populateFilterDropdown(worksheet) {
        const filterSelect = $('#filter-select');
        filterSelect.empty();  // Clear previous options
        const savedFilterName = tableau.extensions.settings.get('filterName');

        worksheet.getFiltersAsync().then((filters) => {
            filters.forEach(filter => {
                let isSelected = filter.fieldName === savedFilterName;
                if (isSelected) {
                    console.log('Filter selected', filter.fieldName);
                }
                filterSelect.append(new Option(text = filter.fieldName, value = filter.fieldName, defaultSelected = isSelected, selected = isSelected));
            });
        });
    }

    // Function to populate parameter dropdown
    function populateParameterDropdown() {
        const parameterSelect = $('#parameter-select');
        parameterSelect.empty();  // Clear previous options
        const savedParameterName = tableau.extensions.settings.get('parameterName');

        tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((parameters) => {
            parameters.forEach(parameter => {
                let isSelected = parameter.name === savedParameterName;
                if (isSelected) {
                    console.log('Parameter selected', parameter.name);
                }
                parameterSelect.append(new Option(text = parameter.name, value = parameter.name, defaultSelected = isSelected, selected = isSelected));
            });
        });
    }

    // Event handler for save button
    $('#save-button').click(() => {
        tableau.extensions.settings.set('worksheetName', $('#worksheet-select').val());
        tableau.extensions.settings.set('filterName', $('#filter-select').val());
        tableau.extensions.settings.set('parameterName', $('#parameter-select').val());
        tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
            console.log('Settings saved', newSavedSettings);
            tableau.extensions.ui.closeDialog('Save successful');
        });
    });
})();
