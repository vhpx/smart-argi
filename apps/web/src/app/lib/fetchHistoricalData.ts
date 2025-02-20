const DOMAIN = process.env.DOMAIN;
const WORKSPACE_ID = process.env.WORKSPACE_ID;
const DATASET_ID = process.env.DATASET_ID;
const API_KEY = process.env.API_KEY;

// Fetch historical data from the remote API
export async function fetchHistoricalData() {
    if (!API_KEY) throw new Error("API_KEY is not defined");

    const response = await fetch(
        `https://${DOMAIN}/api/v1/workspaces/${WORKSPACE_ID}/datasets/${DATASET_ID}/full`,
        {
            headers: {
                "api-key": API_KEY,
                "Content-Type": "application/json",
            },
        },
    );
    const data = await response.json();

    // Extract rows from the returned data
    const rows = data.data;

    // Create an array of flattened objects
    const flattenedData = rows.map((row: any) => ({
        row_id: row.row_id,
        ...row.cells,
    }));

    // Function to process values converting string numbers to numbers
    const processValue = (value: any) => {
        if (value === "…") return null;
        const num = Number(value);
        return isNaN(num) ? value : num;
    };

    // Process each row by converting each value
    const processedData = flattenedData.map((row: any) =>
        Object.fromEntries(
            Object.entries(row).map((
                [key, value],
            ) => [key, processValue(value)]),
        )
    );

    // Filter rows where the date is between "2024M01" and "2024M12"
    const filteredData = processedData.filter((row: any) => {
        if (!row.Date) return false;
        return /^2024M(0[1-9]|1[0-2])$/.test(row.Date);
    });

    const newData = filteredData.map((row: any) => {
        // Parse the date in YYYY-MM-DD format
        const [year, month] = row.Date.match(/^(\d{4})M(\d{2})$/).slice(1);
        const date = `${year}-${month}-01`;

        return {
            Value: row["Rice, Viet Namese 5%"],
            date,
            displayDate: row.Date,
            source: "historical",
        };
    }).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return newData;
}
