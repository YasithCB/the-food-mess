export const success = (res, data, message = "OK", code = 200) => {
    console.log(`[SUCCESS] ${code} - ${message}`);

    if (data) {
        // Print compact single-line JSON preview
        const preview =
            typeof data === "object"
                ? JSON.stringify(data)
                : data;
        console.log(" → Data:", preview);
    }

    return res.status(code).json({
        status: "success",
        code,
        message,
        data,
    });
};

export const error = (res, message = "Something went wrong", code = 500) => {
    console.error(`[ERROR] ${code} - ${message}`);

    return res.status(code).json({
        status: "error",
        code,
        message,
    });
};
