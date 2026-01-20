--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-12-24 12:21:51


--
-- TOC entry 907 (class 1247 OID 73756)
-- Name: entry_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.entry_type AS ENUM (
    'service',
    'payment'
);



--
-- TOC entry 257 (class 1255 OID 73831)
-- Name: auto_insert_bank_ledger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_insert_bank_ledger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
vendor_name TEXT;
BEGIN
IF NEW.type = 'payment' THEN
SELECT vendor_name INTO vendor_name
FROM vendors
WHERE id = NEW.vendor_id;
INSERT INTO BankLedger (
entry_date,
company_id,
particulars,
transaction_id,
dr,
cr
) VALUES (
NEW.entry_date,
NEW.company_id,
'Payment to Vendor ' || COALESCE(vendor_name, 'Unknown'),
NEW.transaction_id,
NEW.cr,
NULL
);
END IF;
RETURN NEW;
END;
$$;





--
-- TOC entry 227 (class 1259 OID 57441)
-- Name: b2bcustomersdetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.b2bcustomersdetails (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    gst_number character varying(50),
    contact_person character varying(100),
    phone_number character varying(255),
    email character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    state_code character varying(10),
    pincode character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE b2bcustomersdetails; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.b2bcustomersdetails IS 'Stores B2B customer details for invoice generation';


--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.company_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.company_name IS 'Name of the B2B customer company';


--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.gst_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.gst_number IS 'GST number of the company';


--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.contact_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.contact_person IS 'Primary contact person name';


--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.phone_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.phone_number IS 'Contact phone number';


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.email IS 'Contact email address';


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.address IS 'Complete address of the company';


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.city; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.city IS 'City of the company';


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.state; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.state IS 'State of the company';


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.state_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.state_code IS 'State code for GST purposes';


--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.pincode; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.pincode IS 'PIN code of the location';


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.created_at IS 'Timestamp when the record was created';


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN b2bcustomersdetails.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.b2bcustomersdetails.updated_at IS 'Timestamp when the record was last updated';


--
-- TOC entry 226 (class 1259 OID 57440)
-- Name: b2bcustomersdetails_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.b2bcustomersdetails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 226
-- Name: b2bcustomersdetails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.b2bcustomersdetails_id_seq OWNED BY public.b2bcustomersdetails.id;


--
-- TOC entry 237 (class 1259 OID 81970)
-- Name: bank_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_ledger (
    id integer NOT NULL,
    payment_date date NOT NULL,
    transaction_id character varying(100) NOT NULL,
    vendor_id integer,
    vendor_name character varying(255),
    amount numeric(15,2) NOT NULL,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer,
    transaction_type character varying(20) DEFAULT 'payment'::character varying,
    CONSTRAINT bank_ledger_amount_check1 CHECK ((amount > (0)::numeric)),
    CONSTRAINT bank_ledger_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['receipt'::character varying, 'payment'::character varying])::text[])))
);



--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE bank_ledger; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bank_ledger IS 'Stores bank transactions for vendor payments and expense payments';


--
-- TOC entry 236 (class 1259 OID 81969)
-- Name: bank_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 236
-- Name: bank_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_ledger_id_seq OWNED BY public.bank_ledger.id;


--
-- TOC entry 222 (class 1259 OID 32769)
-- Name: company_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_details (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    company_address text NOT NULL,
    company_gst_number character varying(50),
    bank_name character varying(255) NOT NULL,
    account_number character varying(100) NOT NULL,
    branch character varying(255) NOT NULL,
    ifsc_code character varying(20) NOT NULL,
    swift_code character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE company_details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.company_details IS 'Stores company details including bank information for payment processing';


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.company_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.company_name IS 'Full legal name of the company';


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.company_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.company_address IS 'Complete address of the company';


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.company_gst_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.company_gst_number IS 'GST registration number of the company';


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.bank_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.bank_name IS 'Name of the bank where the account is held';


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.account_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.account_number IS 'Bank account number (unique identifier)';


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.branch; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.branch IS 'Bank branch name and location';


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.ifsc_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.ifsc_code IS 'Indian Financial System Code for the bank branch';


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN company_details.swift_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_details.swift_code IS 'SWIFT/BIC code for international transactions';


--
-- TOC entry 244 (class 1259 OID 114753)
-- Name: bankledgerreport; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.bankledgerreport AS
 SELECT bl.id,
    bl.payment_date AS entry_date,
    cd.company_name,
    bl.remark AS particulars,
    bl.transaction_id,
        CASE
            WHEN ((bl.transaction_type)::text = 'receipt'::text) THEN bl.amount
            ELSE (0)::numeric
        END AS dr,
        CASE
            WHEN ((bl.transaction_type)::text = 'payment'::text) THEN bl.amount
            ELSE (0)::numeric
        END AS cr,
    sum(
        CASE
            WHEN ((bl.transaction_type)::text = 'receipt'::text) THEN bl.amount
            ELSE (- bl.amount)
        END) OVER (PARTITION BY bl.company_id ORDER BY bl.payment_date, bl.id ROWS UNBOUNDED PRECEDING) AS balance
   FROM (public.bank_ledger bl
     JOIN public.company_details cd ON ((bl.company_id = cd.id)))
  ORDER BY bl.company_id, bl.payment_date, bl.id;



--
-- TOC entry 218 (class 1259 OID 24590)
-- Name: candidate_uploads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_uploads (
    id integer NOT NULL,
    candidate_name character varying(100) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_type character varying(50),
    candidate_id integer,
    file_path character varying(500) DEFAULT ''::character varying NOT NULL,
    mime_type character varying(100),
    file_size integer
);



--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE candidate_uploads; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.candidate_uploads IS 'Stores metadata and JSON data for candidate file uploads';


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.candidate_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.candidate_name IS 'Name of the candidate (e.g., FirstName_LastName_PassportNo)';


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.file_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.file_name IS 'Original filename of the uploaded file';


--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.file_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.file_type IS 'File extension/type (e.g., jpg, pdf, png)';


--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.upload_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.upload_time IS 'Timestamp when the file was uploaded';


--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.image_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.image_type IS 'Type of image (photo, signature, passport_front, passport_back, cdc, marksheet, coc)';


--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.candidate_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.candidate_id IS 'Foreign key reference to candidates(candidate_id)';


--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.mime_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.mime_type IS 'MIME type of the uploaded file (e.g., image/jpeg, application/pdf)';


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN candidate_uploads.file_size; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidate_uploads.file_size IS 'Size of the file in bytes';


--
-- TOC entry 217 (class 1259 OID 24589)
-- Name: candidate_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 217
-- Name: candidate_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_uploads_id_seq OWNED BY public.candidate_uploads.id;


--
-- TOC entry 220 (class 1259 OID 24610)
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    candidate_name character varying(100) NOT NULL,
    json_data jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    session_id character varying(255),
    ocr_data jsonb,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE candidates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.candidates IS 'Main candidate data table with references to uploaded images';


--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.id IS 'Unique candidate ID (Primary Key)';


--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.candidate_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.candidate_name IS 'Unique name of the candidate (e.g., FirstName_LastName_PassportNo)';


--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.json_data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.json_data IS 'Consolidated candidate details in JSON format';


--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.created_at IS 'Timestamp when the candidate record was created';


--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.session_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.session_id IS 'Session ID linking to images in candidate_uploads table';


--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.ocr_data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.ocr_data IS 'OCR extracted data from images';


--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN candidates.last_updated; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.candidates.last_updated IS 'Last update timestamp';


--
-- TOC entry 219 (class 1259 OID 24609)
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 219
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- TOC entry 246 (class 1259 OID 139503)
-- Name: certificate_selections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificate_selections (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    candidate_name character varying(255) NOT NULL,
    certificate_name character varying(255) NOT NULL,
    creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    verification_image character varying(500),
    certificate_image character varying(500),
    client_name character varying(255),
    status character varying(50) DEFAULT 'pending'::character varying,
    certificate_number character varying(15),
    start_date date,
    end_date date,
    issue_date date,
    expiry_date date
);



--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE certificate_selections; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.certificate_selections IS 'Stores certificate details for each candidate with referential integrity';


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.id IS 'Unique identifier for each certificate selection record';


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.candidate_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.candidate_id IS 'Foreign key referencing candidates(id)';


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.candidate_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.candidate_name IS 'Foreign key referencing candidates(candidate_name)';


--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.certificate_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.certificate_name IS 'Name of the certificate';


--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.creation_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.creation_date IS 'Timestamp when the record was created';


--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.verification_image; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.verification_image IS 'File path to the verification PDF document';


--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.certificate_image; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.certificate_image IS 'File path to the certificate PDF document';


--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.client_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.client_name IS 'Client name extracted from candidate json_data';


--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.status IS 'Status of the certificate: "pending" (default), "done" (finalized/billed), or NULL';


--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN certificate_selections.expiry_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certificate_selections.expiry_date IS 'Date when the certificate expires';


--
-- TOC entry 245 (class 1259 OID 139502)
-- Name: certificate_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certificate_selections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 245
-- Name: certificate_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certificate_selections_id_seq OWNED BY public.certificate_selections.id;


--
-- TOC entry 241 (class 1259 OID 90188)
-- Name: client_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_adjustments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    customer_id integer NOT NULL,
    date_of_service date NOT NULL,
    particular_of_service text NOT NULL,
    adjustment_amount numeric(15,2) NOT NULL,
    on_account_of text,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT client_adjustments_adjustment_amount_check CHECK ((adjustment_amount <> (0)::numeric))
);



--
-- TOC entry 240 (class 1259 OID 90187)
-- Name: client_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 240
-- Name: client_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_adjustments_id_seq OWNED BY public.client_adjustments.id;


--
-- TOC entry 229 (class 1259 OID 73729)
-- Name: clientledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientledger (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    date date NOT NULL,
    particulars text,
    voucher_no character varying(100),
    voucher_type character varying(50) DEFAULT 'Receipt'::character varying,
    debit numeric(15,2) DEFAULT 0,
    credit numeric(15,2) DEFAULT 0,
    entry_type character varying(50) DEFAULT 'Manual'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 221 (class 1259 OID 32768)
-- Name: company_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 221
-- Name: company_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_details_id_seq OWNED BY public.company_details.id;


--
-- TOC entry 228 (class 1259 OID 73728)
-- Name: companyledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companyledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 228
-- Name: companyledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companyledger_id_seq OWNED BY public.clientledger.id;


--
-- TOC entry 256 (class 1259 OID 238037)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    course_id character varying(10) NOT NULL,
    course_name character varying(255) NOT NULL,
    topics text
);



--
-- TOC entry 239 (class 1259 OID 90137)
-- Name: expense_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_ledger (
    id integer NOT NULL,
    expense_type character varying(100) NOT NULL,
    company character varying(255) NOT NULL,
    vendor_name character varying(255) NOT NULL,
    vendor_gst_number character varying(15),
    amount numeric(15,2) NOT NULL,
    expense_date date NOT NULL,
    payment_method character varying(50) NOT NULL,
    description text,
    particulars text,
    debit numeric(15,2) DEFAULT 0,
    credit numeric(15,2) DEFAULT 0,
    account_type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer,
    transaction_id character varying(100)
);



--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE expense_ledger; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.expense_ledger IS 'Stores double-entry accounting records for expense payments';


--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN expense_ledger.account_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.expense_ledger.account_type IS 'Type of account: expense (debit) or bank (credit)';


--
-- TOC entry 238 (class 1259 OID 90136)
-- Name: expense_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expense_ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 238
-- Name: expense_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_ledger_id_seq OWNED BY public.expense_ledger.id;


--
-- TOC entry 252 (class 1259 OID 205159)
-- Name: invoice_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_images (
    id integer NOT NULL,
    invoice_no character varying(500) NOT NULL,
    image_type character varying(10) DEFAULT 'pdf'::character varying,
    file_name character varying(255),
    file_size integer,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    voucher_type character varying(50) DEFAULT 'Sales'::character varying,
    file_path character varying(500) DEFAULT ''::character varying
);



--
-- TOC entry 251 (class 1259 OID 205158)
-- Name: invoice_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 251
-- Name: invoice_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_images_id_seq OWNED BY public.invoice_images.id;


--
-- TOC entry 248 (class 1259 OID 205081)
-- Name: master_database_table_a; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_database_table_a (
    id integer NOT NULL,
    creation_date date,
    client_name character varying(255),
    client_id character varying(50),
    candidate_id integer NOT NULL,
    candidate_name character varying(255),
    nationality character varying(100),
    passport character varying(50),
    cdcno character varying(50),
    indosno character varying(50),
    certificate_name text,
    certificate_id text,
    companyname character varying(255),
    person_in_charge character varying(255),
    delivery_note character varying(100),
    delivery_date date,
    terms_of_delivery character varying(100),
    invoice_no character varying(100)
);



--
-- TOC entry 247 (class 1259 OID 205080)
-- Name: master_database_table_a_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_database_table_a_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 247
-- Name: master_database_table_a_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_database_table_a_id_seq OWNED BY public.master_database_table_a.id;


--
-- TOC entry 250 (class 1259 OID 205119)
-- Name: opening_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opening_balances (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    opening_balance numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT opening_balances_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT opening_balances_year_check CHECK (((year >= 2000) AND (year <= 2100)))
);



--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE opening_balances; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.opening_balances IS 'Stores monthly opening balances for companies';


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN opening_balances.opening_balance; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.opening_balances.opening_balance IS 'Opening balance amount for the month';


--
-- TOC entry 249 (class 1259 OID 205118)
-- Name: opening_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opening_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 249
-- Name: opening_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opening_balances_id_seq OWNED BY public.opening_balances.id;


--
-- TOC entry 225 (class 1259 OID 57382)
-- Name: receiptamountreceived; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receiptamountreceived (
    receipt_amount_id integer NOT NULL,
    amount_received numeric(10,2),
    payment_type character varying(50),
    transaction_date date,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    account_no character varying(100),
    company_name character varying(255),
    tds_amount numeric(6,2),
    gst_amount numeric(10,2),
    customer_name character varying(255),
    transaction_id character varying(100),
    on_account_of character varying(255)
);



--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE receiptamountreceived; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receiptamountreceived IS 'Stores receipt/payment data from NewStepper step 6';


--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.receipt_amount_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.receipt_amount_id IS 'Auto-generated primary key';


--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.amount_received; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.amount_received IS 'Actual amount received in payment';


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.payment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.payment_type IS 'Type of payment (e.g., cash, bank transfer)';


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.transaction_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.transaction_date IS 'Date when payment was received';


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.remark; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.remark IS 'Additional remarks or notes';


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.account_no; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.account_no IS 'Account number for the transaction';


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.company_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.company_name IS 'Name of the company involved';


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.tds_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.tds_amount IS 'TDS amount';


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.gst_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.gst_amount IS 'GST amount';


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.customer_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.customer_name IS 'Name of the customer';


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.transaction_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.transaction_id IS 'Unique transaction identifier';


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN receiptamountreceived.on_account_of; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptamountreceived.on_account_of IS 'Description of what the payment is on account of';


--
-- TOC entry 224 (class 1259 OID 57381)
-- Name: receiptamountreceived_receipt_amount_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receiptamountreceived_receipt_amount_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 224
-- Name: receiptamountreceived_receipt_amount_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receiptamountreceived_receipt_amount_id_seq OWNED BY public.receiptamountreceived.receipt_amount_id;


--
-- TOC entry 223 (class 1259 OID 57365)
-- Name: receiptinvoicedata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receiptinvoicedata (
    invoice_no character varying(500) NOT NULL,
    candidate_id integer,
    company_name character varying(500),
    company_account_number character varying(500),
    customer_name character varying(500),
    customer_phone character varying(500),
    party_name character varying(500),
    invoice_date date,
    amount numeric(10,2),
    gst numeric(10,2) DEFAULT 0,
    final_amount numeric(10,2),
    selected_courses jsonb,
    delivery_note character varying(500),
    dispatch_doc_no character varying(500),
    delivery_date date,
    dispatch_through character varying(500),
    destination text,
    terms_of_delivery text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gst_applied numeric(10,2) DEFAULT 0,
    cgst numeric(10,2) DEFAULT 0,
    sgst numeric(10,2) DEFAULT 0
);



--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE receiptinvoicedata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receiptinvoicedata IS 'Stores invoice data from NewStepper steps 1-4';


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN receiptinvoicedata.invoice_no; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptinvoicedata.invoice_no IS 'Unique invoice number (Primary Key)';


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN receiptinvoicedata.candidate_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptinvoicedata.candidate_id IS 'Foreign key reference to candidates table';


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN receiptinvoicedata.final_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptinvoicedata.final_amount IS 'Final amount after discount and GST';


--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN receiptinvoicedata.selected_courses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receiptinvoicedata.selected_courses IS 'JSON array of selected courses/certificates';


--
-- TOC entry 243 (class 1259 OID 90210)
-- Name: vendor_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_adjustments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    vendor_id integer NOT NULL,
    date_of_service date NOT NULL,
    particular_of_service text NOT NULL,
    adjustment_amount numeric(15,2) NOT NULL,
    on_account_of text,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendor_adjustments_adjustment_amount_check CHECK ((adjustment_amount <> (0)::numeric))
);



--
-- TOC entry 242 (class 1259 OID 90209)
-- Name: vendor_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 242
-- Name: vendor_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_adjustments_id_seq OWNED BY public.vendor_adjustments.id;


--
-- TOC entry 235 (class 1259 OID 81946)
-- Name: vendor_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_payments (
    id integer NOT NULL,
    vendor_id integer NOT NULL,
    company_id integer,
    payment_date date NOT NULL,
    transaction_id character varying(100) NOT NULL,
    amount numeric(15,2) NOT NULL,
    on_account_of text,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendor_payments_amount_check CHECK ((amount > (0)::numeric))
);



--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE vendor_payments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vendor_payments IS 'Stores vendor payment entries';


--
-- TOC entry 234 (class 1259 OID 81945)
-- Name: vendor_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 234
-- Name: vendor_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_payments_id_seq OWNED BY public.vendor_payments.id;


--
-- TOC entry 233 (class 1259 OID 81924)
-- Name: vendor_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_services (
    id integer NOT NULL,
    vendor_id integer NOT NULL,
    company_id integer,
    service_date date NOT NULL,
    particulars text NOT NULL,
    amount numeric(15,2) NOT NULL,
    on_account_of text,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendor_services_amount_check CHECK ((amount > (0)::numeric))
);



--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE vendor_services; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vendor_services IS 'Stores vendor service entries (bills/invoices)';


--
-- TOC entry 232 (class 1259 OID 81923)
-- Name: vendor_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 232
-- Name: vendor_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_services_id_seq OWNED BY public.vendor_services.id;


--
-- TOC entry 254 (class 1259 OID 205224)
-- Name: vendorledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendorledger (
    id integer NOT NULL,
    entry_date date NOT NULL,
    vendor_id integer NOT NULL,
    company_id integer NOT NULL,
    type public.entry_type NOT NULL,
    particulars text,
    remark text,
    on_account_of text,
    dr numeric(15,2),
    cr numeric(15,2),
    transaction_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendorledger_cr_check CHECK (((cr IS NULL) OR (cr > (0)::numeric))),
    CONSTRAINT vendorledger_dr_check CHECK (((dr IS NULL) OR (dr > (0)::numeric)))
);



--
-- TOC entry 253 (class 1259 OID 205223)
-- Name: vendorledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendorledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 253
-- Name: vendorledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendorledger_id_seq OWNED BY public.vendorledger.id;


--
-- TOC entry 231 (class 1259 OID 73747)
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    vendor_name text,
    account_number text,
    gst_number text,
    address text,
    email text,
    phone text,
    unused1 text,
    unused2 text,
    company_name text,
    contact_person text,
    pan_number text,
    city text,
    state text,
    pincode text,
    country text,
    alternate_phone text,
    bank_name text,
    bank_account_number text,
    ifsc_code text,
    branch_name text,
    vendor_type text,
    payment_terms text,
    credit_limit integer,
    is_active boolean,
    notes text
);



--
-- TOC entry 255 (class 1259 OID 205248)
-- Name: vendorledgerreport; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vendorledgerreport AS
 SELECT vl.id,
    vl.entry_date,
    v.vendor_name,
    cd.company_name,
    vl.type,
    vl.particulars,
    vl.remark,
    vl.on_account_of,
    vl.dr,
    vl.cr,
    vl.transaction_id,
    sum((COALESCE(vl.dr, (0)::numeric) - COALESCE(vl.cr, (0)::numeric))) OVER (PARTITION BY vl.vendor_id, vl.company_id ORDER BY vl.entry_date, vl.id ROWS UNBOUNDED PRECEDING) AS balance
   FROM ((public.vendorledger vl
     JOIN public.vendors v ON ((vl.vendor_id = v.id)))
     JOIN public.company_details cd ON ((vl.company_id = cd.id)))
  ORDER BY vl.vendor_id, vl.company_id, vl.entry_date, vl.id;



--
-- TOC entry 230 (class 1259 OID 73746)
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 230
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- TOC entry 4866 (class 2604 OID 57444)
-- Name: b2bcustomersdetails id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.b2bcustomersdetails ALTER COLUMN id SET DEFAULT nextval('public.b2bcustomersdetails_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 81973)
-- Name: bank_ledger id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_ledger ALTER COLUMN id SET DEFAULT nextval('public.bank_ledger_id_seq'::regclass);


--
-- TOC entry 4847 (class 2604 OID 24593)
-- Name: candidate_uploads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_uploads ALTER COLUMN id SET DEFAULT nextval('public.candidate_uploads_id_seq'::regclass);


--
-- TOC entry 4852 (class 2604 OID 49445)
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 139506)
-- Name: certificate_selections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_selections ALTER COLUMN id SET DEFAULT nextval('public.certificate_selections_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 90191)
-- Name: client_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_adjustments ALTER COLUMN id SET DEFAULT nextval('public.client_adjustments_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 73732)
-- Name: clientledger id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientledger ALTER COLUMN id SET DEFAULT nextval('public.companyledger_id_seq'::regclass);


--
-- TOC entry 4855 (class 2604 OID 32772)
-- Name: company_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_details ALTER COLUMN id SET DEFAULT nextval('public.company_details_id_seq'::regclass);


--
-- TOC entry 4887 (class 2604 OID 90140)
-- Name: expense_ledger id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_ledger ALTER COLUMN id SET DEFAULT nextval('public.expense_ledger_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 205162)
-- Name: invoice_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_images ALTER COLUMN id SET DEFAULT nextval('public.invoice_images_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 205084)
-- Name: master_database_table_a id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_database_table_a ALTER COLUMN id SET DEFAULT nextval('public.master_database_table_a_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 205122)
-- Name: opening_balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opening_balances ALTER COLUMN id SET DEFAULT nextval('public.opening_balances_id_seq'::regclass);


--
-- TOC entry 4864 (class 2604 OID 57385)
-- Name: receiptamountreceived receipt_amount_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receiptamountreceived ALTER COLUMN receipt_amount_id SET DEFAULT nextval('public.receiptamountreceived_receipt_amount_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 90213)
-- Name: vendor_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_adjustments ALTER COLUMN id SET DEFAULT nextval('public.vendor_adjustments_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 81949)
-- Name: vendor_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments ALTER COLUMN id SET DEFAULT nextval('public.vendor_payments_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 81927)
-- Name: vendor_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_services ALTER COLUMN id SET DEFAULT nextval('public.vendor_services_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 205227)
-- Name: vendorledger id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendorledger ALTER COLUMN id SET DEFAULT nextval('public.vendorledger_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 73750)
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- TOC entry 5200 (class 0 OID 57441)
-- Dependencies: 227
-- Data for Name: b2bcustomersdetails; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5210 (class 0 OID 81970)
-- Dependencies: 237
-- Data for Name: bank_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5191 (class 0 OID 24590)
-- Dependencies: 218
-- Data for Name: candidate_uploads; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5193 (class 0 OID 24610)
-- Dependencies: 220
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5218 (class 0 OID 139503)
-- Dependencies: 246
-- Data for Name: certificate_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5214 (class 0 OID 90188)
-- Dependencies: 241
-- Data for Name: client_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5202 (class 0 OID 73729)
-- Dependencies: 229
-- Data for Name: clientledger; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5195 (class 0 OID 32769)
-- Dependencies: 222
-- Data for Name: company_details; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5227 (class 0 OID 238037)
-- Dependencies: 256
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5212 (class 0 OID 90137)
-- Dependencies: 239
-- Data for Name: expense_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5224 (class 0 OID 205159)
-- Dependencies: 252
-- Data for Name: invoice_images; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5220 (class 0 OID 205081)
-- Dependencies: 248
-- Data for Name: master_database_table_a; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5222 (class 0 OID 205119)
-- Dependencies: 250
-- Data for Name: opening_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5198 (class 0 OID 57382)
-- Dependencies: 225
-- Data for Name: receiptamountreceived; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5196 (class 0 OID 57365)
-- Dependencies: 223
-- Data for Name: receiptinvoicedata; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5216 (class 0 OID 90210)
-- Dependencies: 243
-- Data for Name: vendor_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5208 (class 0 OID 81946)
-- Dependencies: 235
-- Data for Name: vendor_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5206 (class 0 OID 81924)
-- Dependencies: 233
-- Data for Name: vendor_services; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5226 (class 0 OID 205224)
-- Dependencies: 254
-- Data for Name: vendorledger; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5204 (class 0 OID 73747)
-- Dependencies: 231
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 226
-- Name: b2bcustomersdetails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.b2bcustomersdetails_id_seq', 71, true);


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 236
-- Name: bank_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_ledger_id_seq', 50, true);


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 217
-- Name: candidate_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_uploads_id_seq', 564, true);


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 219
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_id_seq', 197, true);


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 245
-- Name: certificate_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.certificate_selections_id_seq', 167, true);


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 240
-- Name: client_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_adjustments_id_seq', 21, true);


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 221
-- Name: company_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_details_id_seq', 15, true);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 228
-- Name: companyledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companyledger_id_seq', 173, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 238
-- Name: expense_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_ledger_id_seq', 57, true);


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 251
-- Name: invoice_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_images_id_seq', 62, true);


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 247
-- Name: master_database_table_a_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.master_database_table_a_id_seq', 351, true);


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 249
-- Name: opening_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opening_balances_id_seq', 1, true);


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 224
-- Name: receiptamountreceived_receipt_amount_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receiptamountreceived_receipt_amount_id_seq', 104, true);


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 242
-- Name: vendor_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_adjustments_id_seq', 6, true);


--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 234
-- Name: vendor_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_payments_id_seq', 11, true);


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 232
-- Name: vendor_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_services_id_seq', 10, true);


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 253
-- Name: vendorledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendorledger_id_seq', 1, false);


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 230
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, false);


--
-- TOC entry 4963 (class 2606 OID 57450)
-- Name: b2bcustomersdetails b2bcustomersdetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.b2bcustomersdetails
    ADD CONSTRAINT b2bcustomersdetails_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 81980)
-- Name: bank_ledger bank_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_ledger
    ADD CONSTRAINT bank_ledger_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 24598)
-- Name: candidate_uploads candidate_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_uploads
    ADD CONSTRAINT candidate_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4935 (class 2606 OID 24620)
-- Name: candidates candidates_candidate_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_candidate_name_key UNIQUE (candidate_name);


--
-- TOC entry 4937 (class 2606 OID 139501)
-- Name: candidates candidates_id_candidate_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_id_candidate_name_unique UNIQUE (id, candidate_name);


--
-- TOC entry 4939 (class 2606 OID 24618)
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 139511)
-- Name: certificate_selections certificate_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_selections
    ADD CONSTRAINT certificate_selections_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 90198)
-- Name: client_adjustments client_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_adjustments
    ADD CONSTRAINT client_adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 32780)
-- Name: company_details company_details_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_details
    ADD CONSTRAINT company_details_account_number_key UNIQUE (account_number);


--
-- TOC entry 4948 (class 2606 OID 32778)
-- Name: company_details company_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_details
    ADD CONSTRAINT company_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 73742)
-- Name: clientledger companyledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientledger
    ADD CONSTRAINT companyledger_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 238045)
-- Name: courses courses_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_id_key UNIQUE (course_id);


--
-- TOC entry 5025 (class 2606 OID 238043)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 90148)
-- Name: expense_ledger expense_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_ledger
    ADD CONSTRAINT expense_ledger_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 205170)
-- Name: invoice_images invoice_images_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_images
    ADD CONSTRAINT invoice_images_invoice_no_key UNIQUE (invoice_no);


--
-- TOC entry 5017 (class 2606 OID 205168)
-- Name: invoice_images invoice_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_images
    ADD CONSTRAINT invoice_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 205090)
-- Name: master_database_table_a master_database_table_a_candidate_id_certificate_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_database_table_a
    ADD CONSTRAINT master_database_table_a_candidate_id_certificate_name_key UNIQUE (candidate_id, certificate_name);


--
-- TOC entry 5005 (class 2606 OID 205088)
-- Name: master_database_table_a master_database_table_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_database_table_a
    ADD CONSTRAINT master_database_table_a_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 205131)
-- Name: opening_balances opening_balances_company_name_month_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opening_balances
    ADD CONSTRAINT opening_balances_company_name_month_year_key UNIQUE (company_name, month, year);


--
-- TOC entry 5010 (class 2606 OID 205129)
-- Name: opening_balances opening_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opening_balances
    ADD CONSTRAINT opening_balances_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 57390)
-- Name: receiptamountreceived receiptamountreceived_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receiptamountreceived
    ADD CONSTRAINT receiptamountreceived_pkey PRIMARY KEY (receipt_amount_id);


--
-- TOC entry 4957 (class 2606 OID 246277)
-- Name: receiptinvoicedata receiptinvoicedata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receiptinvoicedata
    ADD CONSTRAINT receiptinvoicedata_pkey PRIMARY KEY (invoice_no);


--
-- TOC entry 4998 (class 2606 OID 90220)
-- Name: vendor_adjustments vendor_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_adjustments
    ADD CONSTRAINT vendor_adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 81956)
-- Name: vendor_payments vendor_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 81958)
-- Name: vendor_payments vendor_payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_transaction_id_key UNIQUE (transaction_id);


--
-- TOC entry 4974 (class 2606 OID 81934)
-- Name: vendor_services vendor_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_services
    ADD CONSTRAINT vendor_services_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 205235)
-- Name: vendorledger vendorledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendorledger
    ADD CONSTRAINT vendorledger_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 205237)
-- Name: vendorledger vendorledger_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendorledger
    ADD CONSTRAINT vendorledger_transaction_id_key UNIQUE (transaction_id);


--
-- TOC entry 4970 (class 2606 OID 73754)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 1259 OID 81999)
-- Name: idx_bank_ledger_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_ledger_company_id ON public.bank_ledger USING btree (company_id);


--
-- TOC entry 4985 (class 1259 OID 81992)
-- Name: idx_bank_ledger_payment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_ledger_payment_date ON public.bank_ledger USING btree (payment_date);


--
-- TOC entry 4986 (class 1259 OID 81993)
-- Name: idx_bank_ledger_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_ledger_transaction_id ON public.bank_ledger USING btree (transaction_id);


--
-- TOC entry 4987 (class 1259 OID 81991)
-- Name: idx_bank_ledger_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_ledger_vendor_id ON public.bank_ledger USING btree (vendor_id);


--
-- TOC entry 4926 (class 1259 OID 238049)
-- Name: idx_candidate_uploads_candidate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_candidate_id ON public.candidate_uploads USING btree (candidate_id);


--
-- TOC entry 4927 (class 1259 OID 24599)
-- Name: idx_candidate_uploads_candidate_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_candidate_name ON public.candidate_uploads USING btree (candidate_name);


--
-- TOC entry 4928 (class 1259 OID 24603)
-- Name: idx_candidate_uploads_candidate_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_candidate_time ON public.candidate_uploads USING btree (candidate_name, upload_time);


--
-- TOC entry 4929 (class 1259 OID 246275)
-- Name: idx_candidate_uploads_file_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_file_size ON public.candidate_uploads USING btree (file_size);


--
-- TOC entry 4930 (class 1259 OID 24601)
-- Name: idx_candidate_uploads_file_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_file_type ON public.candidate_uploads USING btree (file_type);


--
-- TOC entry 4931 (class 1259 OID 237976)
-- Name: idx_candidate_uploads_image_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_image_type ON public.candidate_uploads USING btree (image_type);


--
-- TOC entry 4932 (class 1259 OID 246274)
-- Name: idx_candidate_uploads_mime_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_mime_type ON public.candidate_uploads USING btree (mime_type);


--
-- TOC entry 4933 (class 1259 OID 24600)
-- Name: idx_candidate_uploads_upload_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_uploads_upload_time ON public.candidate_uploads USING btree (upload_time);


--
-- TOC entry 4940 (class 1259 OID 24621)
-- Name: idx_candidates_candidate_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_candidate_name ON public.candidates USING btree (candidate_name);


--
-- TOC entry 4941 (class 1259 OID 24622)
-- Name: idx_candidates_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_created_at ON public.candidates USING btree (created_at);


--
-- TOC entry 4942 (class 1259 OID 24623)
-- Name: idx_candidates_json_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_json_data ON public.candidates USING gin (json_data);


--
-- TOC entry 4943 (class 1259 OID 98390)
-- Name: idx_candidates_last_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_last_updated ON public.candidates USING btree (last_updated);


--
-- TOC entry 4944 (class 1259 OID 98387)
-- Name: idx_candidates_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_session_id ON public.candidates USING btree (session_id);


--
-- TOC entry 5001 (class 1259 OID 139527)
-- Name: idx_certificate_selections_candidate_id_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificate_selections_candidate_id_name ON public.certificate_selections USING btree (candidate_id, candidate_name);


--
-- TOC entry 4949 (class 1259 OID 32781)
-- Name: idx_company_details_account_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_details_account_number ON public.company_details USING btree (account_number);


--
-- TOC entry 4950 (class 1259 OID 32782)
-- Name: idx_company_details_company_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_details_company_name ON public.company_details USING btree (company_name);


--
-- TOC entry 4951 (class 1259 OID 32783)
-- Name: idx_company_details_ifsc_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_details_ifsc_code ON public.company_details USING btree (ifsc_code);


--
-- TOC entry 4966 (class 1259 OID 73743)
-- Name: idx_company_ledger_company_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_ledger_company_name ON public.clientledger USING btree (company_name);


--
-- TOC entry 4967 (class 1259 OID 73744)
-- Name: idx_company_ledger_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_ledger_date ON public.clientledger USING btree (date);


--
-- TOC entry 4968 (class 1259 OID 73745)
-- Name: idx_company_ledger_voucher_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_ledger_voucher_no ON public.clientledger USING btree (voucher_no);


--
-- TOC entry 4990 (class 1259 OID 90153)
-- Name: idx_expense_ledger_account_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_ledger_account_type ON public.expense_ledger USING btree (account_type);


--
-- TOC entry 4991 (class 1259 OID 90151)
-- Name: idx_expense_ledger_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_ledger_company ON public.expense_ledger USING btree (company);


--
-- TOC entry 4992 (class 1259 OID 90150)
-- Name: idx_expense_ledger_expense_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_ledger_expense_date ON public.expense_ledger USING btree (expense_date);


--
-- TOC entry 4993 (class 1259 OID 90152)
-- Name: idx_expense_ledger_expense_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_ledger_expense_type ON public.expense_ledger USING btree (expense_type);


--
-- TOC entry 4994 (class 1259 OID 205256)
-- Name: idx_expense_ledger_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expense_ledger_transaction_id ON public.expense_ledger USING btree (transaction_id);


--
-- TOC entry 5011 (class 1259 OID 246265)
-- Name: idx_invoice_images_file_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_images_file_path ON public.invoice_images USING btree (file_path);


--
-- TOC entry 5012 (class 1259 OID 205171)
-- Name: idx_invoice_images_invoice_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_images_invoice_no ON public.invoice_images USING btree (invoice_no);


--
-- TOC entry 5013 (class 1259 OID 205173)
-- Name: idx_invoice_images_voucher_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_images_voucher_type ON public.invoice_images USING btree (voucher_type);


--
-- TOC entry 5006 (class 1259 OID 205132)
-- Name: idx_opening_balances_company_month_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opening_balances_company_month_year ON public.opening_balances USING btree (company_name, month, year);


--
-- TOC entry 4958 (class 1259 OID 57408)
-- Name: idx_receipt_amount_received_payment_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_amount_received_payment_type ON public.receiptamountreceived USING btree (payment_type);


--
-- TOC entry 4959 (class 1259 OID 57407)
-- Name: idx_receipt_amount_received_transaction_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_amount_received_transaction_date ON public.receiptamountreceived USING btree (transaction_date);


--
-- TOC entry 4952 (class 1259 OID 57401)
-- Name: idx_receipt_invoice_data_candidate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_invoice_data_candidate_id ON public.receiptinvoicedata USING btree (candidate_id);


--
-- TOC entry 4953 (class 1259 OID 246278)
-- Name: idx_receipt_invoice_data_company_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_invoice_data_company_name ON public.receiptinvoicedata USING btree (company_name);


--
-- TOC entry 4954 (class 1259 OID 57402)
-- Name: idx_receipt_invoice_data_invoice_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_invoice_data_invoice_date ON public.receiptinvoicedata USING btree (invoice_date);


--
-- TOC entry 4955 (class 1259 OID 246279)
-- Name: idx_receipt_invoice_data_party_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_invoice_data_party_name ON public.receiptinvoicedata USING btree (party_name);


--
-- TOC entry 4975 (class 1259 OID 81989)
-- Name: idx_vendor_payments_payment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_payments_payment_date ON public.vendor_payments USING btree (payment_date);


--
-- TOC entry 4976 (class 1259 OID 81990)
-- Name: idx_vendor_payments_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_payments_transaction_id ON public.vendor_payments USING btree (transaction_id);


--
-- TOC entry 4977 (class 1259 OID 81988)
-- Name: idx_vendor_payments_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_payments_vendor_id ON public.vendor_payments USING btree (vendor_id);


--
-- TOC entry 4971 (class 1259 OID 81987)
-- Name: idx_vendor_services_service_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_services_service_date ON public.vendor_services USING btree (service_date);


--
-- TOC entry 4972 (class 1259 OID 81986)
-- Name: idx_vendor_services_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_services_vendor_id ON public.vendor_services USING btree (vendor_id);


--
-- TOC entry 5031 (class 2606 OID 81994)
-- Name: bank_ledger bank_ledger_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_ledger
    ADD CONSTRAINT bank_ledger_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id);


--
-- TOC entry 5032 (class 2606 OID 81981)
-- Name: bank_ledger bank_ledger_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_ledger
    ADD CONSTRAINT bank_ledger_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 5038 (class 2606 OID 139522)
-- Name: certificate_selections certificate_selections_candidate_id_candidate_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_selections
    ADD CONSTRAINT certificate_selections_candidate_id_candidate_name_fkey FOREIGN KEY (candidate_id, candidate_name) REFERENCES public.candidates(id, candidate_name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5039 (class 2606 OID 139512)
-- Name: certificate_selections certificate_selections_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_selections
    ADD CONSTRAINT certificate_selections_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5040 (class 2606 OID 139517)
-- Name: certificate_selections certificate_selections_candidate_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_selections
    ADD CONSTRAINT certificate_selections_candidate_name_fkey FOREIGN KEY (candidate_name) REFERENCES public.candidates(candidate_name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5034 (class 2606 OID 90199)
-- Name: client_adjustments client_adjustments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_adjustments
    ADD CONSTRAINT client_adjustments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id);


--
-- TOC entry 5035 (class 2606 OID 90204)
-- Name: client_adjustments client_adjustments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_adjustments
    ADD CONSTRAINT client_adjustments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.b2bcustomersdetails(id);


--
-- TOC entry 5033 (class 2606 OID 90154)
-- Name: expense_ledger expense_ledger_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_ledger
    ADD CONSTRAINT expense_ledger_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id);


--
-- TOC entry 5026 (class 2606 OID 57376)
-- Name: receiptinvoicedata receiptinvoicedata_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receiptinvoicedata
    ADD CONSTRAINT receiptinvoicedata_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- TOC entry 5036 (class 2606 OID 90221)
-- Name: vendor_adjustments vendor_adjustments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_adjustments
    ADD CONSTRAINT vendor_adjustments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id);


--
-- TOC entry 5037 (class 2606 OID 90226)
-- Name: vendor_adjustments vendor_adjustments_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_adjustments
    ADD CONSTRAINT vendor_adjustments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 5029 (class 2606 OID 81964)
-- Name: vendor_payments vendor_payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id);


--
-- TOC entry 5030 (class 2606 OID 81959)
-- Name: vendor_payments vendor_payments_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 5027 (class 2606 OID 81940)
-- Name: vendor_services vendor_services_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_services
    ADD CONSTRAINT vendor_services_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id);


--
-- TOC entry 5028 (class 2606 OID 81935)
-- Name: vendor_services vendor_services_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_services
    ADD CONSTRAINT vendor_services_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 5041 (class 2606 OID 205243)
-- Name: vendorledger vendorledger_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendorledger
    ADD CONSTRAINT vendorledger_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id) ON DELETE CASCADE;


--
-- TOC entry 5042 (class 2606 OID 205238)
-- Name: vendorledger vendorledger_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendorledger
    ADD CONSTRAINT vendorledger_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO readonly_user;


--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE candidates; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.candidates TO readonly_user;


--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE certificate_selections; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.certificate_selections TO readonly_user;


-- Completed on 2025-12-24 12:21:53

--
-- PostgreSQL database dump complete
--

