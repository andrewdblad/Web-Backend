-- INSERT statement
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- UPDATE to Admin
UPDATE account 
SET account_type = 'Admin'
WHERE account_id = 1;

-- DELETE statement
DELETE FROM account
WHERE account_id = 1;

-- UPDATE inv_description
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'huge interior')
WHERE inv_id = '10';

-- INNER JOIN to select inventory with sport classification
SELECT inv_make, inv_model, classification_name 
FROM inventory
INNER JOIN classification ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- UPDATE to add /vehicles
UPDATE inventory
SET 
    inv_image = CONCAT(
        SUBSTRING(inv_image, 1, POSITION('/' IN inv_image) + 1),
        'vehicles/',
        SUBSTRING(inv_image, POSITION('/' IN inv_image) + 2)
    ),
    inv_thumbnail = CONCAT(
        SUBSTRING(inv_thumbnail, 1, POSITION('/' IN inv_thumbnail) + 1),
        'vehicles/',
        SUBSTRING(inv_thumbnail, POSITION('/' IN inv_thumbnail) + 2)
    );